import { DeepLinkProvider } from './../../providers/deep-link/deep-link'
import { Component } from '@angular/core'
import { IonicPage, NavController, ToastController, NavParams, PopoverController, Platform } from 'ionic-angular'
import { WalletEditPopoverComponent } from './wallet-edit-popover/wallet-edit-popover.component'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'
import { Clipboard } from '@ionic-native/clipboard'
import { ShareUrlProvider } from '../../providers/share-url/share-url'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'
import { WalletSyncSelectionPage } from '../wallet-sync-selection/wallet-sync-selection'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { InteractionProvider } from '../../providers/interaction/interaction'

declare var window: any

@IonicPage()
@Component({
  selector: 'page-wallet-address',
  templateUrl: 'wallet-address.html'
})
export class WalletAddressPage {
  private wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    private popoverCtrl: PopoverController,
    private toastController: ToastController,
    private clipboard: Clipboard,
    private navController: NavController,
    private navParams: NavParams,
    private interactionProvider: InteractionProvider,
    private platform: Platform,
    private shareUrlProvider: ShareUrlProvider,
    private deepLinkProvider: DeepLinkProvider
  ) {
    this.wallet = this.navParams.get('wallet')
  }

  async ionViewDidEnter() {
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
    console.log('walletShareUrl: ' + this.walletShareUrl)
  }

  done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async share() {
    let interactionSetting = await this.interactionProvider.getInteractionSetting()
    if (interactionSetting) {
      switch (interactionSetting) {
        case 'always':
          this.navController
            .push(WalletSyncSelectionPage, {
              wallet: this.wallet,
              walletShareUrl: this.walletShareUrl
            })
            .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          break
        case 'same_device':
          this.deepLinkProvider.sameDeviceDeeplink(this.walletShareUrl)
          break
        case 'offline_device':
          this.navController
            .push(WalletSharePage, { walletShareUrl: this.walletShareUrl })
            .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          break
      }
    } else {
      this.navController
        .push(WalletSyncSelectionPage, {
          wallet: this.wallet,
          walletShareUrl: this.walletShareUrl
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
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
    await this.clipboard.copy(this.wallet.receivingPublicAddress)
    let toast = this.toastController.create({
      message: 'Address was copied to your clipboard',
      duration: 2000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  async copyShareUrlToClipboard() {
    await this.clipboard.copy(this.walletShareUrl)
    let toast = this.toastController.create({
      message: 'Address was copied to your clipboard',
      duration: 2000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    await toast.present()
  }
}
