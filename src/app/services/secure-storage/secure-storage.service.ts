import { Injectable } from '@angular/core'
import { Plugins } from '@capacitor/core'

const { SecurityUtils } = Plugins

export interface SecureStorage {
  init(): Promise<void>
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<any>
  removeItem(key: string): Promise<void>
}

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {

  public isDeviceSecure(): Promise<any> {
    return SecurityUtils.isDeviceSecure({
      alias: 'airgap-secure-storage',
      isParanoia: false
    })
  }

  public secureDevice(): Promise<void> {
    return SecurityUtils.secureDevice({
      alias: 'airgap-secure-storage',
      isParanoia: false
    })
  }

  public async get(alias: string, isParanoia: boolean): Promise<SecureStorage> {
    await SecurityUtils.initStorage({
      alias,
      isParanoia
    })

    return {
      init() {
        return SecurityUtils.initStorage({
          alias,
          isParanoia
        })
      },
      setItem(key, value) {
        return SecurityUtils.setItem({
          alias,
          isParanoia,
          key,
          value
        })
      },
      getItem(key) {
        return SecurityUtils.getItem({
          alias,
          isParanoia,
          key
        })
      },
      removeItem(key) {
        return SecurityUtils.removeItem({
          alias,
          isParanoia,
          key
        })
      }
    }
  }
}
