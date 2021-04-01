import { ExposedPromiseRegistry, flattened } from '@airgap/angular-core'
import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { entropyToMnemonic } from 'bip39'
import { concat, from, Observable, of, Subscriber } from 'rxjs'
import { first, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { Secret } from '../../models/secret'
import { MigrationService } from '../../services/migration/migration.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { isSecretMigrated, isWalletMigrated } from '../../utils/migration'
import { retry } from '../../utils/retry'

import * as actions from './migration.actions'
import * as fromMigration from './migration.reducers'

enum PromiseKey {
  PARANOIA_ACCEPTED = 'paranoiaAccepted',
  BIP39_PASSPHRASE = 'bip39Passphrase'
}

interface PromiseResolveType {
  [PromiseKey.PARANOIA_ACCEPTED]: boolean
  [PromiseKey.BIP39_PASSPHRASE]: string | undefined
}

@Injectable()
export class MigrationEffects {
  public onSuccess: (() => void) | undefined
  public onError: (() => void) | undefined

  public readonly exposedPromises: ExposedPromiseRegistry<PromiseKey, PromiseResolveType> = new ExposedPromiseRegistry()

  public navigationData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.viewWillEnter),
      withLatestFrom(this.secretsService.getSecretsObservable()),
      switchMap(([_, secrets]) => concat(of(actions.navigationDataLoading()), from(this.loadNavigationData(secrets)).pipe(first())))
    )
  )

  public migrationProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.migrationStarted),
      withLatestFrom(this.store.select(fromMigration.selectTargetSecrets)),
      withLatestFrom(this.store.select(fromMigration.selectTargetWalletKeys)),
      switchMap(([[_, secrets], targetWalletKeys]) => this.migrate(secrets.value ?? [], targetWalletKeys))
    )
  )

  public paranoiaAccepted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.paranoiaAccepted),
        tap(() => {
          this.exposedPromises.resolve(PromiseKey.PARANOIA_ACCEPTED, true)
        })
      ),
    { dispatch: false }
  )

  public paranoiaRejected$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.paranoiaRejected),
        tap(() => {
          this.exposedPromises.resolve(PromiseKey.PARANOIA_ACCEPTED, false)
        })
      ),
    { dispatch: false }
  )

  public bip39Passphrase$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.bip39PassphraseProvided),
        tap((action) => {
          this.exposedPromises.resolve(PromiseKey.BIP39_PASSPHRASE, action.passphrase)
        })
      ),
    { dispatch: false }
  )

  public bip39PassphraseRejected$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.bip39PassphraseRejected),
        tap(() => {
          this.exposedPromises.resolve(PromiseKey.BIP39_PASSPHRASE, undefined)
        })
      ),
    { dispatch: false }
  )

  public finished$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.finished),
        tap(() => {
          this.finish()
        })
      ),
    { dispatch: false }
  )

  public onLeft$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.viewLeft),
        tap(() => {
          this.callCallbacks()
        })
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromMigration.State>,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly migrationService: MigrationService
  ) {}

  private async loadNavigationData(allSecrets: Secret[]): Promise<Action> {
    const state = this.navigationService.getState()

    this.onSuccess = state.onSuccess
    this.onError = state.onError

    const [secrets, targetWalletKeys]: [Secret[] | undefined, string[] | undefined] = this.getSecretsAndTargetWalletKeys(state, allSecrets)

    return secrets !== undefined && targetWalletKeys !== undefined
      ? actions.navigationDataLoaded({ secrets, targetWalletKeys })
      : actions.invalidData()
  }

  private getSecretsAndTargetWalletKeys(state: any, allSecrets: Secret[]): [Secret[] | undefined, string[] | undefined] {
    if (state.secrets !== undefined) {
      const secrets: Secret[] = state.secrets.filter((secret: Secret) => !isSecretMigrated(secret))
      const walletKeys: string[] = flattened(
        secrets.map((secret: Secret) =>
          secret.wallets
            .filter((wallet: AirGapWallet) => wallet.status === AirGapWalletStatus.ACTIVE && !isWalletMigrated(wallet))
            .map((wallet: AirGapWallet) => wallet.publicKey)
        )
      )

      return [secrets, walletKeys]
    }

    if (state.wallets !== undefined) {
      const wallets: AirGapWallet[] = state.wallets

      const walletKeys: string[] = wallets
        .filter((wallet: AirGapWallet) => !isWalletMigrated(wallet))
        .map((wallet: AirGapWallet) => wallet.publicKey)

      const walletKeysSet: Set<string> = new Set(walletKeys)

      const secrets: Secret[] = allSecrets.filter((secret: Secret) =>
        secret.wallets.some((wallet: AirGapWallet) => walletKeysSet.has(wallet.publicKey))
      )

      return [secrets, walletKeys]
    }

    return [undefined, undefined]
  }

  private migrate(secrets: Secret[], targetWalletKeys: string[]): Observable<Action> {
    return new Observable((subscriber: Subscriber<Action>) => {
      // tslint:disable-next-line: no-floating-promises
      new Promise<void>(async (resolve) => {
        const targetWalletKeysSet: Set<string> = new Set(targetWalletKeys)
        for (const secret of secrets) {
          await this.migrateSecret(subscriber, secret, targetWalletKeysSet)
        }
        subscriber.next(actions.allSecretsHandled())
        resolve()
      })
        .catch((error) => {
          subscriber.next(actions.unknownError({ message: typeof error === 'string' ? error : error.message }))
        })
        .finally(() => {
          subscriber.complete()
        })
    })
  }

  private async migrateSecret(subscriber: Subscriber<Action>, secret: Secret, targetWalletKeys: Set<string>): Promise<void> {
    subscriber.next(actions.nextSecret({ id: secret.id }))

    if (secret.isParanoia) {
      const paranoiaAccepted: boolean = await this.waitForParanoiaAccepted(subscriber, secret)
      if (!paranoiaAccepted) {
        subscriber.next(actions.secretSkipped({ id: secret.id }))
        return
      }
    }

    const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = entropyToMnemonic(entropy)

    await this.migrationService.migrateSecret(secret, { mnemonic, persist: false })

    for (const wallet of secret.wallets.filter((wallet: AirGapWallet) => targetWalletKeys.has(wallet.publicKey))) {
      await this.migrateWallet(subscriber, wallet, mnemonic)
    }

    subscriber.next(actions.allWalletsHandled())
    await this.secretsService.addOrUpdateSecret(secret, { setActive: false })
  }

  private async waitForParanoiaAccepted(subscriber: Subscriber<Action>, secret: Secret): Promise<boolean> {
    subscriber.next(actions.paranoiaDetected({ secretId: secret.id }))

    return this.exposedPromises.yield(PromiseKey.PARANOIA_ACCEPTED)
  }

  private async migrateWallet(subscriber: Subscriber<Action>, wallet: AirGapWallet, mnemonic: string): Promise<void> {
    subscriber.next(actions.nextWallet({ publicKey: wallet.publicKey }))

    await retry({
      initArgs: '',
      action: (bip39Passphrase: string) => this.migrationService.migrateWallet(wallet, { mnemonic, bip39Passphrase, persist: false }),
      onFailure: async (error: any) => {
        if (this.isInvalidBip39PassphraseError(error)) {
          const bip39Passphrase: string | undefined = await this.askForBip39Passphrase(subscriber, wallet)
          if (bip39Passphrase === undefined) {
            subscriber.next(actions.walletSkipped({ publicKey: wallet.publicKey }))
            return { type: 'abort' }
          }

          return {
            type: 'retry',
            nextArgs: bip39Passphrase
          }
        } else {
          subscriber.next(actions.unknownError({ message: typeof error === 'string' ? error : error.message }))
          return { type: 'abort' }
        }
      }
    })
  }

  private async askForBip39Passphrase(subscriber: Subscriber<Action>, wallet: AirGapWallet): Promise<string | undefined> {
    subscriber.next(actions.invalidBip39Passphrase({ protocolIdentifier: wallet.protocol.identifier, publicKey: wallet.publicKey }))

    return this.exposedPromises.yield(PromiseKey.BIP39_PASSPHRASE)
  }

  private finish(): void {
    this.navigationService.back()
  }

  private callCallbacks(): void {
    if (this.onSuccess !== undefined) {
      this.onSuccess()
    }
  }

  private isInvalidBip39PassphraseError(error: any): boolean {
    return error.message?.toLowerCase().startsWith('invalid bip-39 passphrase')
  }
}
