import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-share-validate',
  templateUrl: './social-recovery-import-share-validate.page.html',
  styleUrls: ['./social-recovery-import-share-validate.page.scss']
})
export class SocialRecoveryImportShareValidatePage implements OnInit {
  public currentShare: number = 1
  public shares: number = 5

  shareName: string = ''
  constructor(private readonly modalController: ModalController, private navigationService: NavigationService) {}

  ngOnInit() {}

  async help() {
    this.modalController
    // TODO Tim: uncomment once merged
    // const modal: HTMLIonModalElement = await this.modalController.create({
    //   component: SocialRecoveryImportHelpPage,
    //   backdropDismiss: false
    // })

    // modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  nextState() {
    let nextStateRoute = 'soccial-recovery-import-share-name'

    if (this.currentShare === this.shares) {
      nextStateRoute = 'social-recovery-import-share-finish'
    }

    this.navigationService
      .routeWithState(nextStateRoute, {
        currentShare: this.currentShare + 1,
        shares: this.shares,
        shareName: this.shareName
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
