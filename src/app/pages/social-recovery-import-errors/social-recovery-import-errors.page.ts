import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-errors',
  templateUrl: './social-recovery-import-errors.page.html',
  styleUrls: ['./social-recovery-import-errors.page.scss']
})
export class SocialRecoveryImportErrorsPage implements OnInit {
  errorTitle = 'Error'
  errorText = ''
  constructor(private readonly modalController: ModalController, private navigationService: NavigationService) {}

  ngOnInit() {}

  public close() {
    this.modalController
      .dismiss()
      .then(() => this.navigationService.route('/social-recovery-import-setup'))
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
