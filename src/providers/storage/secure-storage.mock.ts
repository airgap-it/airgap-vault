import { Injectable } from '@angular/core'
import { SecureStorage } from './secure-storage'

@Injectable()
export class SecureStorageServiceMock {
  isSecure = 1

  constructor() {
    console.log('SecureStorageServiceMock')
  }

  isDeviceSecure(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve(this.isSecure)
    })
  }

  secureDevice(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.warn('SecureStorageServiceMock - This Device is NOT secured')
      resolve()
    })
  }

  get(alias: string, isParanoia: boolean): Promise<SecureStorage> {
    const secureStorage: SecureStorage = {
      init() {
        console.warn('SecureStorageServiceMock')
        return new Promise<void>((resolve, reject) => {
          resolve()
        })
      },
      setItem(key: string, value: string): Promise<void> {
        console.warn('SecureStorageServiceMock')
        localStorage.setItem(alias + '-' + key, value)
        return new Promise<void>((resolve, reject) => {
          resolve()
        })
      },
      getItem(key: string): Promise<any> {
        console.warn('SecureStorageServiceMock')
        const result = localStorage.getItem(alias + '-' + key)
        return new Promise<any>((resolve, reject) => {
          resolve(result)
        })
      },
      removeItem: function(key) {
        console.warn('SecureStorageServiceMock')
        localStorage.removeItem(alias + '-' + key)
        return new Promise<any>((resolve, reject) => {
          resolve()
        })
      }
    }

    return new Promise<SecureStorage>((resolve, reject) => {
      secureStorage.init().then(() => {
        resolve(secureStorage)
      })
    })
  }
}
