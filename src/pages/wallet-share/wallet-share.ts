import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-wallet-share',
  templateUrl: 'wallet-share.html'
})
export class WalletSharePage {
  public interactionUrl: string

  constructor(private navController: NavController, private navParams: NavParams) {
    this.interactionUrl = this.navParams.get('interactionUrl')
  }

  done() {
    this.navController.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
