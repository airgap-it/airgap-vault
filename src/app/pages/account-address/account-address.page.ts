import { ClipboardService, UiEventService } from '@airgap/angular-core'
import { AirGapWallet, IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { MigrationService } from '../../services/migration/migration.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'
import { isWalletMigrated } from '../../utils/migration'

import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'

@Component({
  selector: 'airgap-account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss']
})
export class AccountAddressPage {
  public wallet: AirGapWallet

  private walletShareUrl?: IACMessageDefinitionObjectV3[]
  private walletShareUrlPromise?: Promise<void>

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService,
    private readonly uiEventService: UiEventService,
    private readonly migrationService: MigrationService
  ) {
    this.wallet = this.navigationService.getState().wallet
  }

  public done(): void {
    this.navigationService.routeToSecretsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async share(): Promise<void> {
    await this.waitWalletShareUrl()

    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        iacMessage: this.walletShareUrl
      },
      this.secretsService.getActiveSecret()
    )
  }

  public async presentEditPopover(event: Event): Promise<void> {
    const popover: HTMLIonPopoverElement = await this.popoverCtrl.create({
      component: AccountEditPopoverComponent,
      componentProps: {
        wallet: this.wallet,
        getWalletShareUrl: async () => {
          await this.waitWalletShareUrl()
          return this.walletShareUrl
        },
        onDelete: (): void => {
          this.navigationService.back()
        }
      },
      event,
      translucent: true
    })

    return popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(this.wallet.receivingPublicAddress)
  }

  private async waitWalletShareUrl(): Promise<void> {
    if (this.walletShareUrl !== undefined) {
      return
    }

    await this.migrationService.runWalletsMigration([this.wallet])
    if (!isWalletMigrated(this.wallet)) {
      await this.showWalletNotMigratedAlert()

      return Promise.reject('Cannot create share URL, wallet data is incomplete')
    }

    if (this.walletShareUrlPromise === undefined) {
      this.walletShareUrlPromise = new Promise<IACMessageDefinitionObjectV3[]>(async (resolve) => {
        const shareUrl: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareWalletURL(this.wallet)
        resolve(shareUrl)
      }).then((shareUrl: IACMessageDefinitionObjectV3[]) => {
        this.walletShareUrl = shareUrl
        this.walletShareUrlPromise = undefined
      })
    }

    return this.walletShareUrlPromise
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
