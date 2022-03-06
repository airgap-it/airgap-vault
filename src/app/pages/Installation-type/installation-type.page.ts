import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InstallationType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

declare let cordova: any

@Component({
  selector: 'airgap-installation-type',
  templateUrl: './installation-type.page.html',
  styleUrls: ['./installation-type.page.scss']
})
export class InstallationTypePage {
  public installationType: InstallationType = InstallationType.UNDETERMINED

  public installationTypes: typeof InstallationType = InstallationType

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((installationType) => (this.installationType = installationType))
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
