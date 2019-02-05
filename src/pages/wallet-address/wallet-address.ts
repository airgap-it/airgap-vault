import { Component } from '@angular/core'
import { IonicPage, NavController, ToastController, NavParams, PopoverController } from 'ionic-angular'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { WalletEditPopoverComponent } from './wallet-edit-popover/wallet-edit-popover.component'
import { AirGapWallet } from 'airgap-coin-lib'
import { Clipboard } from '@ionic-native/clipboard'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-wallet-address',
  templateUrl: 'wallet-address.html'
})
export class WalletAddressPage {
  private wallet: AirGapWallet

  constructor(
    private popoverCtrl: PopoverController,
    private toastController: ToastController,
    private clipboard: Clipboard,
    private navController: NavController,
    private navParams: NavParams
  ) {
    this.wallet = this.navParams.get('wallet')
  }

  done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  share() {
    this.navController.push(WalletSharePage, { wallet: this.wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  presentEditPopover(event) {
    let popover = this.popoverCtrl.create(WalletEditPopoverComponent, {
      wallet: this.wallet,
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
    await toast.present()
  }
}
