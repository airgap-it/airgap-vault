import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-distribution-onboarding',
  templateUrl: './distribution-onboarding.page.html',
  styleUrls: ['./distribution-onboarding.page.scss']
})
export class DistributionOnboardingPage implements AfterViewChecked {
  @ViewChild('slideHeading')
  private slideHeading?: ElementRef<HTMLElement>

  public currentSlide: number = 0
  private shouldFocusSlideHeading: boolean = false

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {}

  public ionViewDidEnter(): void {
    this.shouldFocusSlideHeading = true
  }

  public ngAfterViewChecked(): void {
    if (!this.shouldFocusSlideHeading || !this.slideHeading) {
      return
    }

    this.shouldFocusSlideHeading = false
    requestAnimationFrame(() => this.slideHeading?.nativeElement.focus())
  }

  public next(): void {
    this.currentSlide = 1
    this.shouldFocusSlideHeading = true
  }

  public async accept() {
    await this.storageService.set(VaultStorageKey.DISCLAIMER_ELECTRON, true)
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
