import { Injectable } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'
import { SecureStorage } from './secure-storage.service'

@Injectable({
  providedIn: 'root'
})
export class SecureStorageServiceMock {
  public isSecure = 1

  constructor() {
    console.log('SecureStorageServiceMock constructor')
  }

  public isDeviceSecure(): Promise<number> {
    return new Promise<number>(resolve => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve(this.isSecure)
    })
  }

  public secureDevice(): Promise<void> {
    return new Promise<void>(resolve => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve()
    })
  }

  public get(alias: string, _isParanoia: boolean): Promise<SecureStorage> {
    console.log('SecureStorageServiceMock - creating new storage', alias)
    const secureStorage: SecureStorage = {
      init() {
        console.warn('SecureStorageServiceMock - init')

        return new Promise<void>(resolve => {
          resolve()
        })
      },
      setItem(key: string, value: string): Promise<void> {
        console.warn('SecureStorageServiceMock - setItem', key, value)
        localStorage.setItem(alias + '-' + key, value)

        return new Promise<void>(resolve => {
          resolve()
        })
      },
      setRecoverableItem(key: string, value: string): Promise<any> {
        console.warn('SecureStorageServiceMock - setRecoverableItem', key, value)
        const recoverString = '' // TODO: mock it
        localStorage.setItem(alias + '-' + key + '_' + recoverString, value)

        return new Promise<any>(resolve => {
          resolve(recoverString)
        })
      },
      getItem(key: string): Promise<any> {
        console.warn('SecureStorageServiceMock - getItem', key)
        const result = localStorage.getItem(alias + '-' + key)

        return new Promise<any>(resolve => {
          resolve(result)
        })
      },
      recoverItem(key: string, recoveryKey: string): Promise<any> {
        console.warn('SecureStorageServiceMock - recoverItem', key)
        const result = localStorage.getItem(alias + '-' + key + '_' + recoveryKey)

        return new Promise<any>(resolve => {
          resolve(result)
        })
      },
      removeItem(key) {
        console.warn('SecureStorageServiceMock - removeItem', key)
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
