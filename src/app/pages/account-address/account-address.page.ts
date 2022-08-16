import { ClipboardService, DeeplinkService, QRType, UiEventService } from '@airgap/angular-core'
import { AirGapWallet, IACMessageDefinitionObjectV3, MainProtocolSymbols } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { MigrationService } from '../../services/migration/migration.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'
import { isWalletMigrated } from '../../utils/migration'

import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'

interface SyncOption {
  icon: string
  name: string
  qrType: QRType
}

@Component({
  selector: 'airgap-account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss']
})
export class AccountAddressPage {
  public wallet: AirGapWallet

  public get syncOptions(): SyncOption[] {
    const defaultOption = {
      icon: 'airgap-wallet-app-logo.png',
      name: 'AirGap Wallet',
      qrType: QRType.V3
    }
    switch (this.wallet?.protocol.identifier) {
      case MainProtocolSymbols.BTC:
      case MainProtocolSymbols.BTC_SEGWIT:
        return [
          {
            icon: 'bluewallet.png',
            name: 'BlueWallet',
            qrType: QRType.BC_UR
          },
          {
            icon: 'sparrowwallet.png',
            name: 'Sparrow Wallet',
            qrType: QRType.BC_UR
          },
          defaultOption
        ]

      case MainProtocolSymbols.ETH:
        return [
          {
            icon: 'metamask.webp',
            name: 'MetaMask',
            qrType: QRType.METAMASK
          },
          defaultOption
        ]
      default:
        return [defaultOption]
    }
  }

  private shareObject?: IACMessageDefinitionObjectV3[]
  private shareObjectPromise?: Promise<void>
  private walletShareUrl?: string

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly clipboardService: ClipboardService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService,
    private readonly uiEventService: UiEventService,
    private readonly migrationService: MigrationService,
    private readonly deepLinkService: DeeplinkService
  ) {
    this.wallet = this.navigationService.getState().wallet
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async share(qrFormat: QRType = QRType.V3): Promise<void> {
    await this.waitWalletShareUrl()

    this.interactionService.startInteraction({
      operationType: InteractionOperationType.WALLET_SYNC,
      iacMessage: this.shareObject,
      qrFormatPreference: qrFormat
    })
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

  private async waitWalletShareUrl() {
    await this.prepareSyncObject()
    this.walletShareUrl = await this.deepLinkService.generateDeepLinkUrl(this.shareObject)
  }

  private async prepareSyncObject(): Promise<void> {
    if (this.shareObject !== undefined) {
      return
    }

    await this.migrationService.runWalletsMigration([this.wallet])
    if (!isWalletMigrated(this.wallet)) {
      await this.showWalletNotMigratedAlert()

      return Promise.reject('Cannot create share URL, wallet data is incomplete')
    }

    if (this.shareObjectPromise === undefined) {
      this.shareObjectPromise = new Promise<IACMessageDefinitionObjectV3[]>(async (resolve) => {
        const shareObject: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareWalletURL(this.wallet)
        resolve(shareObject)
      }).then((shareObject: IACMessageDefinitionObjectV3[]) => {
        this.shareObject = shareObject
        this.shareObjectPromise = undefined
      })
    }

    return this.shareObjectPromise
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
