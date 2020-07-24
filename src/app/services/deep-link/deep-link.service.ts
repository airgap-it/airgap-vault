import { AlertService } from './../alert/alert.service'
import { Injectable, Inject } from '@angular/core'
import { AppPlugin } from '@capacitor/core'
import { serializedDataToUrlString } from '../../utils/utils'
import { APP_PLUGIN } from '../..//capacitor-plugins/injection-tokens'

@Injectable({
  providedIn: 'root'
})
export class DeepLinkService {
  constructor(private alertService: AlertService, @Inject(APP_PLUGIN) private readonly app: AppPlugin) {}

  public sameDeviceDeeplink(url: string = 'airgap-wallet://'): Promise<void> {
    const deeplinkUrl: string = url.includes('://') ? url : serializedDataToUrlString(url)

    return new Promise((resolve, reject) => {
      this.app
        .openUrl({ url: deeplinkUrl })
        .then(() => {
          console.log('Deeplink called')
          resolve()
        })
        .catch((error) => {
          console.error('deeplink used', deeplinkUrl)
          console.error(error)
          const cancelButton = {
            text: 'deep-link.app-not-found.ok',
            role: 'cancel'
          }
          this.alertService.showTranslatedAlert('deep-link.app-not-found.title', 'deep-link.app-not-found.message', true, [cancelButton])
          reject()
        })
    })
  }
}
