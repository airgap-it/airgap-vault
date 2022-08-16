import { UiEventService } from '@airgap/angular-core'
import { AirGapWallet, AirGapWalletStatus, IACMessageDefinitionObjectV3, MainProtocolSymbols } from '@airgap/coinlib-core'
import { Component, OnInit } from '@angular/core'
import { Platform } from '@ionic/angular'
import { BehaviorSubject, Observable } from 'rxjs'
import { InteractionOperationType, InteractionService } from 'src/app/services/interaction/interaction.service'
import { MigrationService } from 'src/app/services/migration/migration.service'
import { ShareUrlService } from 'src/app/services/share-url/share-url.service'
import { isWalletMigrated } from 'src/app/utils/migration'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { ModeService } from '../../services/mode/mode.service'
import { ModeStrategy } from '../../services/mode/strategy/ModeStrategy'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { SecretEditAction } from '../secret-edit/secret-edit.page'

@Component({
  selector: 'airgap-tab-accounts',
  templateUrl: './tab-accounts.page.html',
  styleUrls: ['./tab-accounts.page.scss']
})
export class TabAccountsPage implements OnInit {
  public readonly secrets: Observable<MnemonicSecret[]>
  public activeSecret: MnemonicSecret

  public symbolFilter: string | undefined

  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  public readonly isAndroid: boolean

  public readonly AirGapWalletStatus: typeof AirGapWalletStatus = AirGapWalletStatus
  private shareObject?: IACMessageDefinitionObjectV3[]
  private shareObjectPromise?: Promise<void>

  constructor(
    private readonly platform: Platform,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly modeService: ModeService,
    private readonly uiEventService: UiEventService,
    private readonly migrationService: MigrationService,
    private readonly interactionService: InteractionService,
    private readonly shareUrlService: ShareUrlService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
    this.isAndroid = this.platform.is('android')
  }

  public async ngOnInit(): Promise<void> {
    this.secretsService.getActiveSecretObservable().subscribe((secret: MnemonicSecret) => {
      if (secret && secret.wallets) {
        this.activeSecret = secret
        this.wallets$.next([...secret.wallets])
      }
    })

    this.secrets.subscribe(async (secrets: MnemonicSecret[]) => {
      if (secrets.length === 0) {
        this.navigationService.route('/secret-setup/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    }) // We should never unsubscribe, because we need to watch this in case a user deletes all his secrets
  }

  public async goToReceiveAddress(wallet: AirGapWallet): Promise<void> {
    if (
      wallet.protocol.identifier === MainProtocolSymbols.BTC ||
      wallet.protocol.identifier === MainProtocolSymbols.BTC_SEGWIT ||
      wallet.protocol.identifier === MainProtocolSymbols.ETH
    ) {
      this.navigationService.routeWithState('/account-address', { wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      await this.prepareSyncObject(wallet)

      this.interactionService.startInteraction({
        operationType: InteractionOperationType.WALLET_SYNC,
        iacMessage: this.shareObject
      })
    }
  }

  private async prepareSyncObject(wallet: AirGapWallet): Promise<void> {
    if (this.shareObject !== undefined) {
      return
    }

    await this.migrationService.runWalletsMigration([wallet])
    if (!isWalletMigrated(wallet)) {
      await this.showWalletNotMigratedAlert()

      return Promise.reject('Cannot create share URL, wallet data is incomplete')
    }

    if (this.shareObjectPromise === undefined) {
      this.shareObjectPromise = new Promise<IACMessageDefinitionObjectV3[]>(async (resolve) => {
        const shareObject: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareWalletURL(wallet)
        resolve(shareObject)
      }).then((shareObject: IACMessageDefinitionObjectV3[]) => {
        this.shareObject = shareObject
        this.shareObjectPromise = undefined
      })
    }

    return this.shareObjectPromise
  }

  public filterItems(event: any): void {
    function isValidSymbol(data: unknown): data is string {
      return data && typeof data === 'string' && data !== ''
    }

    const value: unknown = event.target.value

    this.symbolFilter = isValidSymbol(value) ? value.trim().toLowerCase() : undefined
  }

  public async syncWallets(): Promise<void> {
    const strategy: ModeStrategy = await this.modeService.strategy()
    await strategy.syncAll()
  }

  public addWallet(): void {
    this.navigationService.route('/account-add').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public navigateToRecoverySettings() {
    this.navigationService
      .routeWithState('/secret-edit', {
        secret: this.activeSecret,
        action: SecretEditAction.SET_RECOVERY_KEY
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private async showWalletNotMigratedAlert(): Promise<void> {
    return this.uiEventService.showTranslatedAlert({
      header: 'wallet-address.alert.wallet-not-migrated.header',
      message: 'wallet-address.alert.wallet-not-migrated.message',
      buttons: [
        {
          text: 'wallet-address.alert.wallet-not-migrated.button_label'
        }
      ]
    })
  }
}
