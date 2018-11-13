import { Injectable } from '@angular/core'
import { Platform } from 'ionic-angular'

declare var jailbreakdetection: any
declare var rootdetection: any

@Injectable()
export class DeviceProvider {
  constructor(private platform: Platform) {}

  checkForRoot() {
    return new Promise((resolve, reject) => {
      if (this.platform.is('android') && this.platform.is('cordova')) {
        // TODO build own android root detection with https://github.com/scottyab/rootbeer
        rootdetection.isDeviceRooted(resolve, reject)
      } else if (this.platform.is('ios') && this.platform.is('cordova')) {
        jailbreakdetection.isJailbroken(resolve, reject)
      } else {
        console.warn('root detection skipped - no supported platform')
        resolve(false)
      }
    })
  }
}
