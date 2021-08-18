import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { from, of } from 'rxjs'
import { filter, first, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { Secret } from '../../models/secret'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { MigrationService } from '../../services/migration/migration.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'

import * as actions from './account-share-select.actions'
import * as fromAccountShareSelect from './account-share-select.reducers'

@Injectable()
export class AccountShareSelectEffects {
  public secrets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.viewInitialization),
      withLatestFrom(this.secretsService.getSecretsObservable()),
      switchMap(([_, secrets]) => of(actions.initialDataLoaded({ secrets })))
    )
  )

  public shareUrl$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.syncButtonClicked),
      withLatestFrom(this.store.select(fromAccountShareSelect.selectCheckedSecrets)),
      filter(([_, checkedSecrets]) => checkedSecrets.length > 0),
      switchMap(([_, checkedSecrets]) => from(this.generateShareUrl(checkedSecrets)).pipe(first()))
    )
  )

  public sync$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.shareUrlGenerated, actions.migrationAlertAccepted),
        tap((action) => {
          this.syncAccounts(action.shareUrl as IACMessageDefinitionObjectV3[]) // JGD remove typecast
        })
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromAccountShareSelect.State>,
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly migrationService: MigrationService
  ) {}

  private async generateShareUrl(secrets: Secret[]): Promise<Action> {
    await this.migrationService.runSecretsMigration(secrets)
    const [migratedSecrets, allMigrated]: [Secret[], boolean] = this.migrationService.deepFilterMigratedSecretsAndWallets(secrets)
    if (migratedSecrets.length === 0) {
      return actions.walletsNotMigrated()
    }

    const shareUrl: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareSecretsURL(migratedSecrets)

    return allMigrated ? actions.shareUrlGenerated({ shareUrl }) : actions.shareUrlGeneratedExcludedLegacy({ shareUrl })
  }

  private syncAccounts(shareUrl: IACMessageDefinitionObjectV3[]): void {
    this.interactionService.startInteraction({
      operationType: InteractionOperationType.WALLET_SYNC,
      iacMessage: shareUrl
    })
  }
}
