import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { WalletEditPopoverComponent } from './wallet-edit-popover/wallet-edit-popover.component'
import { AirGapWallet } from 'airgap-coin-lib'

/**
 * Generated class for the WalletAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet-address',
  templateUrl: 'wallet-address.html'
})
export class WalletAddressPage {

  private wallet: AirGapWallet

  constructor(private popoverCtrl: PopoverController, private navController: NavController, private navParams: NavParams) {
    this.wallet = this.navParams.get('wallet')
  }

  done() {
    this.navController.pop()
  }

  share() {
    this.navController.push(WalletSharePage, { wallet: this.wallet })
  }

  presentEditPopover(event) {
    let popover = this.popoverCtrl.create(WalletEditPopoverComponent, {
      wallet: this.wallet,
      onDelete: () => {
        this.done()
      }
    })
    popover.present({
      ev: event
    })
  }

}
