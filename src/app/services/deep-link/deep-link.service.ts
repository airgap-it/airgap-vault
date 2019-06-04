import { Injectable } from '@angular/core'
import { Platform, AlertController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from './../error-handler/error-handler.service'
import { TranslateService } from '@ngx-translate/core'

declare let window: any

@Injectable({
  providedIn: 'root'
})
export class DeepLinkService {
  constructor(private platform: Platform, private alertCtrl: AlertController, private translateService: TranslateService) {}

  sameDeviceDeeplink(url: string = 'airgap-wallet://'): Promise<void> {
    return new Promise((resolve, reject) => {
      let sApp

      if (this.platform.is('android')) {
        sApp = window.startApp.set({
          action: 'ACTION_VIEW',
          uri: url,
          flags: ['FLAG_ACTIVITY_NEW_TASK']
        })
      } else if (this.platform.is('ios')) {
        sApp = window.startApp.set(url)
      } else {
        this.showDeeplinkOnlyOnDevicesAlert()
        return reject()
      }

      sApp.start(
        () => {
          console.log('Deeplink called')
          resolve()
        },
        error => {
          console.error('deeplink used', url)
          console.error(error)
          this.showAppNotFoundAlert()
          return reject()
        }
      )
    })
  }

  showDeeplinkOnlyOnDevicesAlert() {
    this.translateService
      .get(['deep-link.not-supported-alert.title', 'deep-link.not-supported-alert.message', 'deep-link.not-supported-alert.ok'])
      .subscribe(async translated => {
        let alert = await this.alertCtrl.create({
          header: translated['deep-link.not-supported-alert.title'],
          message: translated['deep-link.not-supported-alert.message'],
          backdropDismiss: false,
          buttons: [
            {
              text: translated['deep-link.not-supported-alert.ok'],
              role: 'cancel'
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }

  showAppNotFoundAlert() {
    this.translateService
      .get(['deep-link.app-not-found.title', 'deep-link.app-not-found.message', 'deep-link.app-not-found.ok'], {
        otherAppName: 'AirGap Wallet'
      })
      .subscribe(async translated => {
        let alert = await this.alertCtrl.create({
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
}
