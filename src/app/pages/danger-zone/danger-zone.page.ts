import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-danger-zone',
  templateUrl: './danger-zone.page.html',
  styleUrls: ['./danger-zone.page.scss']
})
export class DangerZonePage implements OnInit {
  constructor(
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    public readonly storageService: VaultStorageService,
    private readonly secureStorage: SecureStorageService,
    private readonly navigationService: NavigationService
  ) {}

  ngOnInit() {}

  public async resetVault() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe.alert.title'),
      message: this.translateService.instant('danger-zone.wipe.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe.alert.cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('danger-zone.wipe.alert.ok'),
          handler: async () => {
            try {
              await this.secureStorage.wipe()
              await this.storageService.wipe()
            } catch (e) {
              console.error('Wiping failed', e)
              return this.resetVaultError()
            }

            this.navigationService.route('/').then(() => {
              location.reload()
            })
          }
        }
      ]
    })
    alert.present()
  }

  public async resetVaultError() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe-error.alert.title'),
      message: this.translateService.instant('danger-zone.wipe-error.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe-error.alert.ok')
        }
      ]
    })
    alert.present()
  }

  public async goToIsolatedModules() {
    this.navigationService.route('/isolated-modules-list').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
