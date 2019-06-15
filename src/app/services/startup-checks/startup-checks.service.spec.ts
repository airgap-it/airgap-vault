import { SecureStorageService } from './../storage/storage.service'
import { DeviceService } from './../device/device.service'
import { SecureStorageServiceMock } from './../storage/secure-storage.mock'
import { UnitHelper } from './../../../../test-config/unit-test-helper'
import { async, TestBed } from '@angular/core/testing'
import { NavController, NavParams, Platform, ModalController } from '@ionic/angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'

import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock,
  NavParamsMock,
  DeviceProviderMock,
  ModalControllerMock,
  NavControllerMock
} from './../../../../test-config/ionic-mocks'

import { Storage } from '@ionic/storage'
import { SecretsService } from '../secrets/secrets.service'
import { StartupChecksService } from './startup-checks.service'
import { StorageMock } from 'test-config/storage-mock'

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

  beforeEach(() => {
    startupChecksService = TestBed.get(StartupChecksService)
    storageProvider = TestBed.get(Storage)
    deviceProvider = TestBed.get(DeviceService)
    secureStorage = TestBed.get(SecureStorageService)

    secureStorage.isSecure = 1
    deviceProvider.isRooted = 0
    storageProvider.set('DISCLAIMER_INITIAL', true)
    storageProvider.set('INTRODUCTION_INITIAL', true)
  })

  it('should be created', () => {
    expect(startupChecksService instanceof StartupChecksService).toBe(true)
  })

  it('should should show root modal if device is rooted', async(() => {
    deviceProvider.isRooted = 1

    startupChecksService.initChecks().catch(consequence => {
      expect(consequence.name).toBe('rootCheck')
    })
  }))

  it('should should show disclaimer modal if the disclaimer has not been accepted yet', async(() => {
    storageProvider.set('DISCLAIMER_INITIAL', false)

    startupChecksService
      .initChecks()
      .then(() => {
        expect(true).toEqual(false) // we should not get here
      })
      .catch(consequence => {
        expect(consequence.name).toBe('disclaimerAcceptedCheck')
      })
  }))

  it('should should show the introduction modal if the introduction has not been accepted yet', async(() => {
    storageProvider.set('INTRODUCTION_INITIAL', false)

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

  it('should resolve is everything is ok', async(() => {
    storageProvider.set('DISCLAIMER_INITIAL', true)
    storageProvider.set('INTRODUCTION_INITIAL', true)
    secureStorage.isSecure = 1
    deviceProvider.isRooted = 0

    startupChecksService.initChecks()
  }))
})
