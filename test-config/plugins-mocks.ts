// tslint:disable: max-classes-per-file
import { AppInfoPlugin } from '@airgap/angular-core'
import { AppPlugin } from '@capacitor/app'
import { ClipboardPlugin } from '@capacitor/clipboard'
import { SplashScreenPlugin } from '@capacitor/splash-screen'
import { StatusBarPlugin } from '@capacitor/status-bar'

import { SaplingNativePlugin, SecurityUtilsPlugin } from '../src/app/capacitor-plugins/definitions'

import { newSpy } from './unit-test-helper'

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
    'addListener',
    'waitForOverlayDismiss'
  ])
}

export function createSaplingSpy(): SaplingNativePlugin {
  return jasmine.createSpyObj('SaplingPlugin', ['isSupported'])
}

export function createSplashScreenSpy(): SplashScreenPlugin {
  return jasmine.createSpyObj('SplashScreenPlugin', ['hide'])
}

export function createStatusBarSpy(): StatusBarPlugin {
  return jasmine.createSpyObj('StatusBarPlugin', ['setStyle', 'setBackgroundColor'])
}

export class AppInfoPluginMock {
  public get: jasmine.Spy = newSpy(
    'set',
    Promise.resolve({
      appName: 'AirGap.UnitTest',
      packageName: 'AirGap',
      versionName: '0.0.0',
      versionCode: 0
    })
  )
}

export class AppLauncherMock {
  public openUrl: jasmine.Spy = newSpy('openUrl', Promise.resolve())
}

export class SaplingPluginMock {
  public isSupported: jasmine.Spy = newSpy('isSupported', Promise.resolve(false))
}

export class StatusBarMock {
  public setStyle: jasmine.Spy = newSpy('setStyle', Promise.resolve())
  public setBackgroundColor: jasmine.Spy = newSpy('setBackgroundColor', Promise.resolve())
}

export class SplashScreenMock {
  public hide: jasmine.Spy = newSpy('hide', Promise.resolve())
}
