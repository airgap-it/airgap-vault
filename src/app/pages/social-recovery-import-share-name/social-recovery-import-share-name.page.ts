import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SocialRecoveryImportHelpPage } from '../social-recovery-import-help/social-recovery-import-help.page'
// import { SocialRecoveryImportShareService } from 'src/app/social-recovery-import-share/social-recovery-import-share.service'

@Component({
  selector: 'airgap-social-recovery-import-share-name',
  templateUrl: './social-recovery-import-share-name.page.html',
  styleUrls: ['./social-recovery-import-share-name.page.scss']
})
export class SocialRecoveryImportShareNamePage implements OnInit {
  public currentShareNumber: number
  public numberOfShares: number = 0

  shareName: string = ''

  defaulBacktHref: string

  public socialRecoveryForm: FormGroup

  // sharesMap: Map<number, { shareName: string; share: string[] }>

  constructor(
    public formBuilder: FormBuilder,
    private readonly modalController: ModalController,
    private navigationService: NavigationService // private readonly socialRecoveryImportShareService: SocialRecoveryImportShareService
  ) {
    // this.sharesMap = this.socialRecoveryImportShareService.getMap()

    this.socialRecoveryForm = this.formBuilder.group({
      shareName: ''
    })

    this.socialRecoveryForm.valueChanges.subscribe((val: any) => {
      if (val && val.shareName) {
        this.shareName = val.shareName
      }
    })
  }

  ionViewWillEnter() {
    const state = this.navigationService?.getState()

    this.numberOfShares = state.numberOfShares
    this.currentShareNumber = state.currentShareNumber ?? 0
    this.defaulBacktHref = this.currentShareNumber > 0 ? 'social-recovery-import-share-validate' : 'social-recovery-import-setup'
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
    this.socialRecoveryForm.reset()

    this.navigationService
      .routeWithState('/social-recovery-import-share-validate', {
        currentShareNumber: this.currentShareNumber,
        numberOfShares: this.numberOfShares,
        shareName: this.shareName
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
