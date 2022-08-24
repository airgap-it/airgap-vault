import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InstallationType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-installation-type',
  templateUrl: './installation-type.page.html',
  styleUrls: ['./installation-type.page.scss']
})
export class InstallationTypePage {
  public installationType: InstallationType = InstallationType.UNDETERMINED

  public installationTypes: typeof InstallationType = InstallationType

  /**
   * This will be true if the page is opened as a modal from the settings page.
   */
  public isSettingsModal: boolean = false

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((installationType) => (this.installationType = installationType))
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
}
