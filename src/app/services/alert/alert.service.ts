import { AlertButton } from '@ionic/core'
import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'
import { TranslateService } from '@ngx-translate/core'
import { Diagnostic } from '@ionic-native/diagnostic/ngx'

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly diagnostic: Diagnostic
  ) {}

  // secret.service.ts
  // transaction-detail.page.ts
  public async showErrorAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: title,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay!',
          role: 'cancel'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  // secret-show.page.ts
  public async showConfirmOnlyAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['Okay']
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  // deep-link.service.ts
  public showAppNotFoundAlert(): void {
    this.translateService
      .get(['deep-link.app-not-found.title', 'deep-link.app-not-found.message', 'deep-link.app-not-found.ok'], {
        otherAppName: 'AirGap Wallet'
      })
      .subscribe(async (translated: string[]) => {
        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: translated['deep-link.app-not-found.title'],
          message: translated['deep-link.app-not-found.message'],
          backdropDismiss: false,
          buttons: [
            {
              text: translated['deep-link.app-not-found.ok'],
              role: 'cancel'
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }

  // scheme-routing.service.ts
  public showTranslatedAlert(title: string, message: string, buttons: AlertButton[]): void {
    const translationKeys = [title, message, ...buttons.map((button) => button.text)]
    this.translateService.get(translationKeys).subscribe(async (values) => {
      const translatedButtons = buttons.map((button) => {
        button.text = values[button.text]
        return button
      })

      const alert = await this.alertCtrl.create({
        header: values[title],
        message: values[message],
        backdropDismiss: true,
        buttons: translatedButtons
      })

      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }

  // permissions.service.ts
  public async showPermissionsAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: title,
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Open settings',
          handler: () => {
            this.diagnostic.switchToSettings().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
          }
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
