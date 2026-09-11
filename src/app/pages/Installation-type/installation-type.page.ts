import { Component, ElementRef, ViewChild } from '@angular/core'
import { IonContent, ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InstallationType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-installation-type',
  templateUrl: './installation-type.page.html',
  styleUrls: ['./installation-type.page.scss']
})
export class InstallationTypePage {
  @ViewChild('pageHeading')
  private readonly pageHeading?: ElementRef<HTMLElement>

  @ViewChild(IonContent)
  private readonly content?: IonContent

  public installationType: InstallationType = InstallationType.UNDETERMINED

  public installationTypes: typeof InstallationType = InstallationType

  /**
   * This will be true if the page is opened as a modal from the settings page.
   */
  public isSettingsModal: boolean = false
  public isInitialOnboarding: boolean = false
  public saveError: boolean = false

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((installationType) => (this.installationType = installationType))
  }

  public ionViewDidEnter(): void {
    requestAnimationFrame(() => {
      this.content?.scrollToTop(0)?.catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      this.pageHeading?.nativeElement.focus()
    })
  }

  public close() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public selectInstallationType(installationType: InstallationType): void {
    this.installationType = installationType
  }

  public async next(): Promise<void> {
    this.saveError = false
    try {
      await this.storageService.set(VaultStorageKey.INSTALLATION_TYPE, this.installationType)
      await this.modalController.dismiss({ accepted: true })
    } catch (error) {
      this.saveError = true
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error as Error)
    }
  }
}
