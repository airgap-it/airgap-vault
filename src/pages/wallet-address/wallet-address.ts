import { DeepLinkProvider } from './../../providers/deep-link/deep-link'
import { Component } from '@angular/core'
import { IonicPage, NavController, ToastController, NavParams, PopoverController, Platform } from 'ionic-angular'
import { WalletEditPopoverComponent } from './wallet-edit-popover/wallet-edit-popover.component'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'
import { ClipboardProvider } from '../../providers/clipboard/clipboard'
import { ShareUrlProvider } from '../../providers/share-url/share-url'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'
import { InteractionSelectionPage } from '../interaction-selection/interaction-selection'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { InteractionProvider, InteractionOperationType, InteractionSetting } from '../../providers/interaction/interaction'

declare var window: any

@IonicPage()
@Component({
  selector: 'page-wallet-address',
  templateUrl: 'wallet-address.html'
})
export class WalletAddressPage {
  public wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    private popoverCtrl: PopoverController,
    private toastController: ToastController,
    private clipboardProvider: ClipboardProvider,
    private navController: NavController,
    private navParams: NavParams,
    private secretsProvider: SecretsProvider,
    private platform: Platform,
    private shareUrlProvider: ShareUrlProvider,
    private deepLinkProvider: DeepLinkProvider,
    private interactionProvider: InteractionProvider
  ) {
    this.wallet = this.navParams.get('wallet')
  }

  async ionViewDidEnter() {
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
  }

  done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async share() {
    this.interactionProvider.startInteraction(
      this.navController,
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: this.walletShareUrl
      },
      this.secretsProvider.getActiveSecret()
    )
  }

  presentEditPopover(event) {
    let popover = this.popoverCtrl.create(WalletEditPopoverComponent, {
      wallet: this.wallet,
      walletShareUrl: this.walletShareUrl,
      onDelete: () => {
        this.done()
      }
    })
    popover
      .present({
        ev: event
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  async copyAddressToClipboard() {
    await this.clipboardProvider.copyAndShowToast(this.wallet.receivingPublicAddress)
  }
}
