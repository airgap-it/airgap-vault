import { Component } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-finish',
  templateUrl: './social-recovery-generate-finish.page.html',
  styleUrls: ['./social-recovery-generate-finish.page.scss']
})
export class SocialRecoveryGenerateFinishPage {
  private required: number
  private readonly shares: string[]

  get numberOfShares(): number {
    return this.shares.length
  }

  get sharesRequired(): number {
    return this.required
  }

  constructor(private readonly navigationService: NavigationService) {
    this.shares = this.navigationService.getState().shares
    this.required = this.navigationService.getState().required
  }

  next() {
    this.navigationService.route('/tabs/tab-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
