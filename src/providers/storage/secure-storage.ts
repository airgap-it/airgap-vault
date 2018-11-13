import { Injectable } from '@angular/core'

declare var window

interface CordovaSecureStorage {
  init(successCallback: Function, errorCallback: Function)
  setItem(key: string, value: string, successCallback: Function, errorCallback: Function)
  getItem(key: string, successCallback: Function, errorCallback: Function)
  removeItem(key: string, successCallback: Function, errorCallback: Function)
  isDeviceSecure(successCallback: Function, errorCallback: Function)
  secureDevice(successCallback: Function, errorCallback: Function)
}

export interface SecureStorage {
  init(): Promise<void>
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<any>
  removeItem(key: string): Promise<void>
}

@Injectable()
export class SecureStorageService {
  private create(alias: string, isParanoia: boolean): CordovaSecureStorage {
    return new window.SecureStorage(alias, isParanoia)
  }

  isDeviceSecure(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.create('airgap-secure-storage', false).isDeviceSecure(resolve, reject)
    })
  }

  secureDevice(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.create('airgap-secure-storage', false).secureDevice(resolve, reject)
    })
  }

  get(alias: string, isParanoia: boolean): Promise<SecureStorage> {
    let secureStorage = this.create(alias, isParanoia)
    return new Promise<SecureStorage>((resolve, reject) => {
      secureStorage.init(
        () => {
          resolve({
            init: function() {
              return new Promise<void>((resolve, reject) => {
                secureStorage.init(resolve, reject)
              })
            },
            setItem: function(key, value) {
              return new Promise<void>((resolve, reject) => {
                secureStorage.setItem(key, value, resolve, reject)
              })
            },
            getItem: function(key) {
              return new Promise<any>((resolve, reject) => {
                secureStorage.getItem(key, resolve, reject)
              })
            },
            removeItem: function(key) {
              return new Promise<void>((resolve, reject) => {
                secureStorage.removeItem(key, resolve, reject)
              })
            }
          })
        },
        err => {
          reject(err)
        }
      )
    })
  }
}
