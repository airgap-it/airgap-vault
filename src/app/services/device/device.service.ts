import { Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'

declare var jailbreakdetection: any
declare var rootdetection: any

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(private readonly platform: Platform) {}

  public checkForRoot(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('cordova') && this.platform.is('android')) {
        // TODO build own android root detection with https://github.com/scottyab/rootbeer
        rootdetection.isDeviceRooted((isRooted: 0 | 1 /* 1 = rooted, 0 = not rooted*/) => {
          resolve(isRooted === 1)
        }, reject)
      } else if (this.platform.is('cordova') && this.platform.is('ios')) {
        jailbreakdetection.isJailbroken(resolve, reject)
      } else {
        console.warn('root detection skipped - no supported platform')
        resolve(false)
      }
    })
  }

  public async checkForElectron(): Promise<boolean> {
    return typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0
  }
}
