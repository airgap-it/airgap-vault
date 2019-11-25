import { Component, ViewChild } from '@angular/core'
import { IonSlides, ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { StorageService, SettingsKey } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-distribution-onboarding',
  templateUrl: './distribution-onboarding.page.html',
  styleUrls: ['./distribution-onboarding.page.scss']
})
export class DistributionOnboardingPage {
  @ViewChild(IonSlides, { static: true })
  public slides: IonSlides

  constructor(private readonly modalController: ModalController, private readonly storageService: StorageService) {}

  public async next() {
    this.slides.slideNext()
  }

  public async accept() {
    await this.storageService.set(SettingsKey.DISCLAIMER_ELECTRON, true)
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
