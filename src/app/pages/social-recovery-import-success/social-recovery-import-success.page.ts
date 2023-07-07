import { Component, OnInit } from '@angular/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-success',
  templateUrl: './social-recovery-import-success.page.html',
  styleUrls: ['./social-recovery-import-success.page.scss']
})
export class SocialRecoveryImportSuccessPage implements OnInit {
  private secret: MnemonicSecret

  constructor(private navigationService: NavigationService) {}

  ionViewWillEnter() {
    const state = this.navigationService?.getState()

    this.secret = state.secret
  }

  ngOnInit() {}

  nextState() {
    this.navigationService.routeWithState('secret-add', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
