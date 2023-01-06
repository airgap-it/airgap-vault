import { Component } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-rules',
  templateUrl: './social-recovery-generate-rules.page.html',
  styleUrls: ['./social-recovery-generate-rules.page.scss']
})
export class SocialRecoveryGenerateRulesPage {
  public state: 0 | 1 | 2 | 3 | 4 | 5 = 0
  private readonly shares: string[]

  constructor(private readonly navigationService: NavigationService) {
    this.shares = this.navigationService.getState().shares
    console.log('shares', this.shares)
  }

  changeState(i: 0 | 1 | 2 | 3 | 4 | 5) {
    this.state = i
  }

  prevState() {
    if (this.state <= 0) return
    this.state--
  }

  nextState() {
    if (this.state < 5) {
      this.state++
      return
    } else {
      this.navigationService
        .routeWithState('/social-recovery-generate-share-show', {
          currentShare: 0,
          shares: this.shares
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
