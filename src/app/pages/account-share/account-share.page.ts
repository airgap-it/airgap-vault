import { handleErrorLocal, ErrorCategory } from './../../services/error-handler/error-handler.service'
import { Component } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'

@Component({
  selector: 'account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: string

  constructor(private navController: NavController, private navParams: NavParams) {
    this.interactionUrl = this.navParams.get('interactionUrl')
  }

  done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
