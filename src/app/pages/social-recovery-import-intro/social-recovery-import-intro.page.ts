import { Component, OnInit } from '@angular/core'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-intro',
  templateUrl: './social-recovery-import-intro.page.html',
  styleUrls: ['./social-recovery-import-intro.page.scss']
})
export class SocialRecoveryImportIntroPage implements OnInit {
  constructor(private readonly navigationService: NavigationService) {}

  ngOnInit() {}

  nextState() {
    this.navigationService.route('/social-recovery-import-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
