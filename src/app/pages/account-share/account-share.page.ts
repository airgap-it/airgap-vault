import { Component } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: string

  constructor(private readonly navController: NavController, private readonly navParams: NavParams) {
    this.interactionUrl = this.navParams.get('interactionUrl')
  }

  public done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
