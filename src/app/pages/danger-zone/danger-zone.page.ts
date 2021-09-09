import { ClipboardService } from '@airgap/angular-core'
import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { ErrorCategory, handleErrorLocal, LocalErrorLogger } from 'src/app/services/error-handler/error-handler.service'
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
    private readonly navigationService: NavigationService,
    private readonly alertController: AlertController,
    private readonly clipboardService: ClipboardService
  ) {}

  ngOnInit() {}

  public async copyErrorHistory(): Promise<void> {
    const logger = new LocalErrorLogger()
    const numberOfErrors = (await logger.getErrorHistory()).length
    if (numberOfErrors > 0) {
      const alert: HTMLIonAlertElement = await this.alertController.create({
        header: 'Copy Error History',
        subHeader: 'WARNING',
        message:
          '<b>It is possible that the error history contains your private keys, so you should ONLY use this feature if you are testing your device without any funds on it.</b><br /><br />If you encounter an error while using AirGap Vault, sending the developers your local error history could help them pinpoint the problem.<br /><br />Send this error history <b>only</b> to hi@airgap.it, along with a detailed description of your problem.',
        inputs: [
          {
            name: 'understood',
            type: 'checkbox',
            label: 'I understand',
            value: 'understood',
            checked: false
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Copy',
            handler: async (result: string[]) => {
              if (result.includes('understood')) {
                const errorHistory = await new LocalErrorLogger().getErrorHistoryFormatted()
                this.clipboardService.copyAndShowToast(errorHistory, 'Local error history copied to clipboard')
              }
            }
          }
        ]
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    } else {
      return this.noErrors()
    }
  }

  async noErrors() {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'No errors',
      message: `No recent errors occured, we can't copy anything to your clipboard.`,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  async resetVault() {
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

  async resetVaultError() {
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
}
