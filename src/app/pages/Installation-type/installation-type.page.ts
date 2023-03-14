import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InstallationType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'
import { OnboardingWelcomePage } from '../onboarding-welcome/onboarding-welcome.page'

@Component({
  selector: 'airgap-installation-type',
  templateUrl: './installation-type.page.html',
  styleUrls: ['./installation-type.page.scss']
})
export class InstallationTypePage {
  public installationType: InstallationType = InstallationType.UNDETERMINED

  public installationTypes: typeof InstallationType = InstallationType

  public isOnboardingFlow: boolean = false

  /**
   * This will be true if the page is opened as a modal from the settings page.
   */
  public isSettingsModal: boolean = false

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((installationType) => (this.installationType = installationType))
    this.storageService.get(VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING).then((value) => (this.isOnboardingFlow = !value))
  }

  public close() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public next() {
    this.storageService
      .set(VaultStorageKey.INSTALLATION_TYPE, this.installationType)
      .then(() => {
        this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      })
      .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
  }

  public async goToOnboardingWelcomePage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: OnboardingWelcomePage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
