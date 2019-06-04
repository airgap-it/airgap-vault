import { handleErrorLocal, ErrorCategory } from './../error-handler/error-handler.service'
import { SecureStorage } from './storage.service'
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class SecureStorageServiceMock {
  isSecure = 1

  constructor() {
    console.log('SecureStorageServiceMock')
  }

  isDeviceSecure(): Promise<number> {
    return new Promise<number>(resolve => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve(this.isSecure)
    })
  }

  secureDevice(): Promise<void> {
    return new Promise<void>(resolve => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve()
    })
  }

  get(alias: string, _isParanoia: boolean): Promise<SecureStorage> {
    const secureStorage: SecureStorage = {
      init() {
        console.warn('SecureStorageServiceMock')
        return new Promise<void>(resolve => {
          resolve()
        })
      },
      setItem(key: string, value: string): Promise<void> {
        console.warn('SecureStorageServiceMock')
        localStorage.setItem(alias + '-' + key, value)
        return new Promise<void>(resolve => {
          resolve()
        })
      },
      getItem(key: string): Promise<any> {
        console.warn('SecureStorageServiceMock')
        const result = localStorage.getItem(alias + '-' + key)
        return new Promise<any>(resolve => {
          resolve(result)
        })
      },
      removeItem: function(key) {
        console.warn('SecureStorageServiceMock')
        localStorage.removeItem(alias + '-' + key)
        return new Promise<any>(resolve => {
          resolve()
        })
      }
    }

    return new Promise<SecureStorage>(resolve => {
      secureStorage
        .init()
        .then(() => {
          resolve(secureStorage)
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    })
  }
}
