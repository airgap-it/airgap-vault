import { AppPlugin, ClipboardPlugin, SplashScreenPlugin, StatusBarPlugin, StoragePlugin } from '@capacitor/core';
import { newSpy } from './unit-test-helper';
import { SecurityUtilsPlugin, AppInfoPlugin } from 'src/app/capacitor-plugins/definitions';

export function createAppSpy(): AppPlugin {
    return jasmine.createSpyObj('AppPlugin', ['addListener', 'openUrl'])
}

export function createAppInfoSpy(): AppInfoPlugin {
    return jasmine.createSpyObj('AppInfoPlugin', ['get'])
}

export function createClipboardSpy(): ClipboardPlugin {
    return jasmine.createSpyObj('ClipboardPlugin', ['read', 'write'])
}

export function createSecurityUtilsSpy(): SecurityUtilsPlugin {
    return jasmine.createSpyObj('SecurityUtilsPlugin', [
        'assessDeviceIntegrity',
        'authenticate',
        'setInvalidationTimeout',
        'invalidate',
        'toggleAutomaticAuthentication',
        'setAuthenticationReason',
        'initStorage',
        'isDeviceSecure',
        'secureDevice',
        'getItem',
        'setItem',
        'removeItem',
        'removeAll',
        'destroy',
        'setWindowSecureFlag',
        'clearWindowSecureFlag',
        'addListener'
    ])
}

export function createSplashScreenSpy(): SplashScreenPlugin {
    return jasmine.createSpyObj('SplashScreenPlugin', ['hide'])
}

export function createStatusBarSpy(): StatusBarPlugin {
    return jasmine.createSpyObj('StatusBarPlugin', ['setStyle', 'setBackgroundColor'])
}

export function createStorageSpy(): StoragePlugin {
    return jasmine.createSpyObj('StoragePlugin', ['get', 'set', ])
}

export class AppInfoPluginMock {
    public get: jasmine.Spy = newSpy('set', Promise.resolve({
      appName: 'AirGap.UnitTest',
      packageName: 'AirGap',
      versionName: '0.0.0',
      versionCode: 0
    }))
  }

  export class StatusBarMock {
    public setStyle: jasmine.Spy = newSpy('setStyle', Promise.resolve())
    public setBackgroundColor: jasmine.Spy = newSpy('setBackgroundColor', Promise.resolve())
  }
  
  export class SplashScreenMock {
    public hide: jasmine.Spy = newSpy('hide', Promise.resolve())
  }

  export class StoragePluginMock {
    private readonly data: any = {}
    
      public get(options: { key: string }): Promise<{ value: any }> {
        return new Promise((resolve, _reject) => {
          let value = this.data[options.key]
          if (!value) {
            value = 'null'
          }
          resolve({ value })
        })
      }
    
      public set(options: { key: string, value: any }): Promise<void> {
        return new Promise((resolve, _reject) => {
          this.data[options.key] = options.value
          resolve()
        })
      }
    
      public remove(options: { key: string }): Promise<void> {
        return new Promise((resolve, _reject) => {
          delete this.data[options.key]
          resolve()
        })
      }
  }