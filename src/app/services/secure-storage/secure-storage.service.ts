import { Injectable } from '@angular/core'

declare var window

interface CordovaSecureStorage {
  init(successCallback: Function, errorCallback: Function)
  setItem(key: string, value: string, successCallback: Function, errorCallback: Function)
  getItem(key: string, successCallback: Function, errorCallback: Function)
  setupRecoveryPassword(key: string, value: string, successCallback: Function, errorCallback: Function)
  removeItem(key: string, successCallback: Function, errorCallback: Function)
  isDeviceSecure(successCallback: Function, errorCallback: Function)
  secureDevice(successCallback: Function, errorCallback: Function)
}

export interface SecureStorage {
  init(): Promise<void>
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<any>
  setupRecoveryPassword(key: string, value: string): Promise<any>
  removeItem(key: string): Promise<void>
}

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private create(alias: string, isParanoia: boolean): CordovaSecureStorage {
    return new window.SecurityUtils.SecureStorage(alias, isParanoia)
  }

  public isDeviceSecure(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.create('airgap-secure-storage', false).isDeviceSecure(resolve, reject)
    })
  }

  public secureDevice(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.create('airgap-secure-storage', false).secureDevice(resolve, reject)
    })
  }

  public get(alias: string, isParanoia: boolean): Promise<SecureStorage> {
    const secureStorage = this.create(alias, isParanoia)

    return new Promise<SecureStorage>((resolve, reject) => {
      secureStorage.init(
        () => {
          resolve({
            init() {
              return new Promise<void>((resolve, reject) => {
                secureStorage.init(resolve, reject)
              })
            },
            setItem(key, value) {
              return new Promise<void>((resolve, reject) => {
                secureStorage.setItem(key, value, resolve, reject)
              })
            },
            setupRecoveryPassword(key, value) {
              return new Promise<any>((resolve, reject) => {
                secureStorage.setupRecoveryPassword(key, value, resolve, reject)
              })
            },
            getItem(key) {
              return new Promise<any>((resolve, reject) => {
                secureStorage.getItem(key, resolve, reject)
              })
            },
            removeItem(key) {
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
