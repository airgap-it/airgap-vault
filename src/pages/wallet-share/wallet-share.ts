import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'page-wallet-share',
  templateUrl: 'wallet-share.html'
})
export class WalletSharePage {
  private walletShareUrl: string

  constructor(private navController: NavController, private navParams: NavParams) {
    this.walletShareUrl = this.navParams.get('walletShareUrl')
  }

  done() {
    this.navController.popToRoot().then(null)
  }
}
