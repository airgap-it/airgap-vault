import { async, TestBed } from '@angular/core/testing'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'
import { ModalController, NavController, NavParams, Platform } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { StorageMock } from 'test-config/storage-mock'

import { SecretsService } from '../secrets/secrets.service'

import {
  DeviceProviderMock,
  ModalControllerMock,
  NavControllerMock,
  NavParamsMock,
  PlatformMock,
  SplashScreenMock,
  StatusBarMock
} from './../../../../test-config/ionic-mocks'
import { UnitHelper } from './../../../../test-config/unit-test-helper'
import { DeviceService } from './../device/device.service'
import { SecureStorageServiceMock } from './../secure-storage/secure-storage.mock'
import { SecureStorageService } from './../secure-storage/secure-storage.service'
import { StartupChecksService } from './startup-checks.service'

describe('StartupCheck Service', () => {
  let startupChecksService: StartupChecksService
  let storageProvider: Storage
  let secureStorage: SecureStorageServiceMock
  let deviceProvider: DeviceProviderMock

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          StartupChecksService,
          SecretsService,
          { provide: DeviceService, useClass: DeviceProviderMock },
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
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    startupChecksService = TestBed.get(StartupChecksService)
    storageProvider = TestBed.get(Storage)
    deviceProvider = TestBed.get(DeviceService)
    secureStorage = TestBed.get(SecureStorageService)

    secureStorage.isSecure = 1
    deviceProvider.isRooted = false
    deviceProvider.isElectron = false
    await storageProvider.set('DISCLAIMER_INITIAL', true)
    await storageProvider.set('INTRODUCTION_INITIAL', true)
  })

  it('should be created', () => {
    expect(startupChecksService instanceof StartupChecksService).toBe(true)
  })

  it('should should show root modal if device is rooted', async(() => {
    deviceProvider.isRooted = true

    startupChecksService.initChecks().catch(consequence => {
      expect(consequence.name).toBe('rootCheck')
    })
  }))

  it('should should show disclaimer modal if the disclaimer has not been accepted yet', async(async () => {
    await storageProvider.set('DISCLAIMER_INITIAL', false)

    startupChecksService
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
      })
      .catch(consequence => {
        expect(consequence.name).toBe('disclaimerAcceptedCheck')
      })
  }))

  it('should should show the introduction modal if the introduction has not been accepted yet', async(async () => {
    await storageProvider.set('INTRODUCTION_INITIAL', false)

    startupChecksService
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
      })
      .catch(consequence => {
        expect(consequence.name).toBe('introductionAcceptedCheck')
      })
  }))

  it('should should show the device security modal if device is not secure', async(() => {
    secureStorage.isSecure = 0

    startupChecksService
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
      })
      .catch(consequence => {
        expect(consequence.name).toBe('deviceSecureCheck')
      })
  }))

  it('should resolve if everything is ok', async(async () => {
    await storageProvider.set('DISCLAIMER_INITIAL', true)
    await storageProvider.set('INTRODUCTION_INITIAL', true)
    secureStorage.isSecure = 1
    deviceProvider.isRooted = false
    deviceProvider.isElectron = false

    startupChecksService.initChecks()
  }))
})
