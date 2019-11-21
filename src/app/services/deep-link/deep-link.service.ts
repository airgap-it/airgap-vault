import { Injectable } from '@angular/core'
import { AlertController, Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'
import { serializedDataToUrlString } from 'src/app/utils/utils'

declare let window: any

@Injectable({
  providedIn: 'root'
})
export class DeepLinkService {
  constructor(
    private readonly platform: Platform,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService
  ) {}

  public sameDeviceDeeplink(url: string = 'airgap-wallet://'): Promise<void> {
    const deeplinkUrl: string = url.includes('://') ? url : serializedDataToUrlString(url)

    return new Promise((resolve, reject) => {
      let sApp

      if (this.platform.is('android')) {
        sApp = window.startApp.set({
          action: 'ACTION_VIEW',
          uri: deeplinkUrl,
          flags: ['FLAG_ACTIVITY_NEW_TASK']
        })
      } else if (this.platform.is('ios')) {
        sApp = window.startApp.set(deeplinkUrl)
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
          console.error('deeplink used', deeplinkUrl)
          console.error(error)
          this.showAppNotFoundAlert()

          return reject()
        }
      )
    })
  }

  public showDeeplinkOnlyOnDevicesAlert(): void {
    this.translateService
      .get(['deep-link.not-supported-alert.title', 'deep-link.not-supported-alert.message', 'deep-link.not-supported-alert.ok'])
      .pipe(first())
      .subscribe(async (translated: string[]) => {
        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
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
}
