import { Component, OnInit } from '@angular/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-intro',
  templateUrl: './social-recovery-import-intro.page.html',
  styleUrls: ['./social-recovery-import-intro.page.scss']
})
export class SocialRecoveryImportIntroPage implements OnInit {
  public state: 0 | 1 | 2 = 0
  private readonly secret: MnemonicSecret
  constructor(private readonly navigationService: NavigationService) {
    this.secret = this.navigationService.getState().secret
  }

  ngOnInit() {}

  nextState() {
    if (this.state < 2) {
      this.state++
      return
    } else if (this.state >= 2) {
      this.navigationService
        .routeWithState('/social-recovery-import-setup', { secret: this.secret })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
