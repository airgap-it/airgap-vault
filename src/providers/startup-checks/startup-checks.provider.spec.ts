import { async, TestBed } from '@angular/core/testing'
import { NavController, NavParams, Platform, ModalController } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'

import { PlatformMock, StatusBarMock, SplashScreenMock, NavParamsMock, DeviceProviderMock } from '../../../test-config/mocks-ionic'
import { NavControllerMock, ModalControllerMock } from 'ionic-mocks'

import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { StorageMock } from '../../../test-config/storage-mock'
import { Storage } from '@ionic/storage'
import { SecureStorageServiceMock } from '../../providers/storage/secure-storage.mock'
import { StartupChecksProvider } from './startup-checks.provider'
import { DeviceProvider } from '../device/device'

describe('StartupCheck Provider', () => {
  let startupChecksProvider: StartupChecksProvider
  let storageProvider: Storage
  let secureStorage: SecureStorageServiceMock
  let deviceProvider: DeviceProviderMock

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        StartupChecksProvider,
        SecretsProvider,
        { provide: DeviceProvider, useClass: DeviceProviderMock },
        { provide: ModalController, useClass: ModalControllerMock },
        { provide: SecureStorageService, useClass: SecureStorageServiceMock },
        { provide: Storage, useClass: StorageMock },
        { provide: NavController, useClass: NavControllerMock },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock }
      ]
    })
  }))

  beforeEach(async () => {
    startupChecksProvider = TestBed.get(StartupChecksProvider)
    storageProvider = TestBed.get(Storage)
    deviceProvider = TestBed.get(DeviceProvider)
    secureStorage = TestBed.get(SecureStorageService)

    secureStorage.isSecure = 1
    deviceProvider.isRooted = 0
    await storageProvider.set('DISCLAIMER_INITIAL', true)
    await storageProvider.set('INTRODUCTION_INITIAL', true)
  })

  it('should be created', () => {
    expect(startupChecksProvider instanceof StartupChecksProvider).toBe(true)
  })

  it('should should show root modal if device is rooted', async done => {
    deviceProvider.isRooted = 1

    startupChecksProvider
      .initChecks()
      .then(() => {
        done()
      })
      .catch(consequence => {
        expect(consequence.name).toBe('rootCheck')
        done()
      })
  })

  it('should should show disclaimer modal if the disclaimer has not been accepted yet', async done => {
    await storageProvider.set('DISCLAIMER_INITIAL', false)

    startupChecksProvider
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
        done()
      })
      .catch(consequence => {
        expect(consequence.name).toBe('disclaimerAcceptedCheck')
        done()
      })
  })

  it('should should show the introduction modal if the introduction has not been accepted yet', async done => {
    await storageProvider.set('INTRODUCTION_INITIAL', false)

    startupChecksProvider
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
        done()
      })
      .catch(consequence => {
        expect(consequence.name).toBe('introductionAcceptedCheck')
        done()
      })
  })

  it('should should show the device security modal if device is not secure', async done => {
    secureStorage.isSecure = 0

    startupChecksProvider
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
        done()
      })
      .catch(consequence => {
        expect(consequence.name).toBe('deviceSecureCheck')
        done()
      })
  })

  it('should resolve is everything is ok', async done => {
    await storageProvider.set('DISCLAIMER_INITIAL', true)
    await storageProvider.set('INTRODUCTION_INITIAL', true)
    secureStorage.isSecure = 1
    deviceProvider.isRooted = 0

    startupChecksProvider.initChecks().then(() => {
      done()
    })
  })
})
