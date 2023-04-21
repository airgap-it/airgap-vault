import { Component } from '@angular/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-intro',
  templateUrl: './social-recovery-generate-intro.page.html',
  styleUrls: ['./social-recovery-generate-intro.page.scss']
})
export class SocialRecoveryGenerateIntroPage {
  public state: 0 | 1 | 2 = 0
  private readonly secret: MnemonicSecret

  constructor(private readonly navigationService: NavigationService) {
    this.secret = this.navigationService.getState().secret
  }

  nextState() {
    if (this.state < 2) {
      this.state++
      return
    } else if (this.state >= 2) {
      this.navigationService
        .routeWithState('/social-recovery-generate-setup', { secret: this.secret })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
