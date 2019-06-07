import { Component, ViewChild } from '@angular/core'
import { IonSlides, ModalController } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-distribution-onboarding',
  templateUrl: './distribution-onboarding.page.html',
  styleUrls: ['./distribution-onboarding.page.scss']
})
export class DistributionOnboardingPage {
  @ViewChild(IonSlides)
  public slides: IonSlides

  constructor(private readonly modalController: ModalController, private readonly storage: Storage) {}

  public async next() {
    this.slides.slideNext()
  }

  public async accept() {
    await this.storage.set('DISCLAIMER_ELECTRON', true)
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
