import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SocialRecoveryImportHelpPage } from '../social-recovery-import-help/social-recovery-import-help.page'

@Component({
  selector: 'airgap-social-recovery-import-share-name',
  templateUrl: './social-recovery-import-share-name.page.html',
  styleUrls: ['./social-recovery-import-share-name.page.scss']
})
export class SocialRecoveryImportShareNamePage implements OnInit {
  public currentShare: number = 0
  public numberOfShares: number = 0

  shareName: string = ''

  defaulBacktHref = this.currentShare > 0 ? 'social-recovery-import-share-validate' : 'social-recovery-import-setup'

  public socialRecoveryForm: FormGroup

  constructor(
    public formBuilder: FormBuilder,
    private readonly modalController: ModalController,
    private navigationService: NavigationService
  ) {
    const state = this.navigationService.getState()
    this.numberOfShares = state.numberOfShares

    this.socialRecoveryForm = this.formBuilder.group({
      shareName: ''
    })

    this.socialRecoveryForm.valueChanges.subscribe((val: any) => {
      if (val && val.shareName) {
        this.shareName = val.shareName
        console.log('this sharename', this.shareName)
      }
    })
  }

  ngOnInit() {}

  async help() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: SocialRecoveryImportHelpPage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
  nextState() {
    this.navigationService
      .routeWithState('/social-recovery-import-share-validate', {
        currentShare: this.currentShare,
        shares: this.numberOfShares,
        shareName: this.shareName
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
