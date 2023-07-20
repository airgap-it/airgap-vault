import { Component, ElementRef, ViewChild } from '@angular/core'
import { IonicSlides, ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-distribution-onboarding',
  templateUrl: './distribution-onboarding.page.html',
  styleUrls: ['./distribution-onboarding.page.scss']
})
export class DistributionOnboardingPage {
  public readonly swiperModules = [IonicSlides]
  
  @ViewChild('slides', { static: true })
  public slidesRef: ElementRef | undefined

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {}

  public async next() {
    await this.slidesRef?.nativeElement.swiper.slideNext()
  }

  public async accept() {
    await this.storageService.set(VaultStorageKey.DISCLAIMER_ELECTRON, true)
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
