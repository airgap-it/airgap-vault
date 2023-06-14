import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-social-recovery-import-help',
  templateUrl: './social-recovery-import-help.page.html',
  styleUrls: ['./social-recovery-import-help.page.scss']
})
export class SocialRecoveryImportHelpPage implements OnInit {
  constructor(private readonly modalController: ModalController) {}

  ngOnInit() {}

  public close() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
