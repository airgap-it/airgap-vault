import { Injectable } from '@angular/core'
import { Platform } from 'ionic-angular'

declare let window: any

@Injectable()
export class DeepLinkProvider {
  constructor(private platform: Platform) {}

  sameDeviceDeeplink(url: string) {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: url,
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(url)
    }

    sApp.start(
      () => {
        console.log('OK')
      },
      error => {
        console.error(error)
        alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
      }
    )
  }
}
