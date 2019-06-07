import { Component } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'
import { Router } from '@angular/router'

@Component({
  selector: 'account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: string

  constructor(private readonly router: Router) {
    this.interactionUrl = window.history.state.interactionUrl
  }

  public done() {
    this.router.navigateByUrl('/tabs/tab-accounts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
