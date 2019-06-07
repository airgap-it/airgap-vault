import { Component } from '@angular/core'

import { Secret } from '../../models/secret'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'app-social-recovery-show-share',
  templateUrl: './social-recovery-show-share.page.html',
  styleUrls: ['./social-recovery-show-share.page.scss']
})
export class SocialRecoveryShowSharePage {
  public secret: Secret
  public shares: string[]
  public currentShare: number

  constructor(private readonly navigationService: NavigationService) {
    this.shares = this.navigationService.getState().shares
    this.secret = this.navigationService.getState().secret
    this.currentShare = this.navigationService.getState().currentShare
  }

  public back() {
    this.navigationService.back()
  }

  public next() {
    this.navigationService
      .routeWithState('/social-recovery-validate-share', { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
