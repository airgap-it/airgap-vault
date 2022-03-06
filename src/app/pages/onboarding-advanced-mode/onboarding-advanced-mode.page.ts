import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-onboarding-advanced-mode',
  templateUrl: './onboarding-advanced-mode.page.html',
  styleUrls: ['./onboarding-advanced-mode.page.scss']
})
export class OnboardingAdvancedModePage {
  public advancedModeType: AdvancedModeType = AdvancedModeType.UNDETERMINED

  public advancedModeTypes: typeof AdvancedModeType = AdvancedModeType

  /**
   * This will be true if the page is opened as a modal from the settings page.
   */
  public isSettingsModal: boolean = false

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.ADVANCED_MODE_TYPE).then((advancedMode) => (this.advancedModeType = advancedMode))
  }

  public close() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public next() {
    this.storageService
      .set(VaultStorageKey.ADVANCED_MODE_TYPE, this.advancedModeType)
      .then(() => {
        this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      })
      .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
  }
}
