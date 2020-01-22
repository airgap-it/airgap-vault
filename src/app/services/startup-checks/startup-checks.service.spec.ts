import { async, TestBed } from '@angular/core/testing'
import { ModalController, NavController, NavParams, Platform } from '@ionic/angular'

import {
  DeviceProviderMock,
  ModalControllerMock,
  NavControllerMock,
  NavParamsMock,
  PlatformMock,
} from '../../../../test-config/ionic-mocks'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { DeviceService } from '../device/device.service'
import { SecretsService } from '../secrets/secrets.service'
import { SecureStorageServiceMock } from '../secure-storage/secure-storage.mock'
import { SecureStorageService } from '../secure-storage/secure-storage.service'

import { StartupChecksService } from './startup-checks.service'
import { STATUS_BAR_PLUGIN, SPLASH_SCREEN_PLUGIN, STORAGE_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { StoragePlugin } from '@capacitor/core'
import { StatusBarMock, SplashScreenMock, StoragePluginMock } from 'test-config/plugins-mocks'

describe('StartupCheck Service', () => {
  let startupChecksService: StartupChecksService
  let storageProvider: StoragePlugin
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
          { provide: STORAGE_PLUGIN, useClass: StoragePluginMock },
          { provide: NavController, useClass: NavControllerMock },
          { provide: NavParams, useClass: NavParamsMock },
          { provide: STATUS_BAR_PLUGIN, useClass: StatusBarMock },
          { provide: SPLASH_SCREEN_PLUGIN, useClass: SplashScreenMock },
          { provide: Platform, useClass: PlatformMock }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    startupChecksService = TestBed.get(StartupChecksService)
    storageProvider = TestBed.get(STORAGE_PLUGIN)
    deviceProvider = TestBed.get(DeviceService)
    secureStorage = TestBed.get(SecureStorageService)

    secureStorage.isSecure = 1
    deviceProvider.isRooted = false
    deviceProvider.isElectron = false
    await storageProvider.set({ 
      key: 'DISCLAIMER_INITIAL', 
      value: JSON.stringify(true)
    })
    await storageProvider.set({
      key: 'INTRODUCTION_INITIAL', 
      value: JSON.stringify(true)
    })
  })

  it('should be created', () => {
    expect(startupChecksService instanceof StartupChecksService).toBe(true)
  })

  it('should show root modal if device is rooted', async(() => {
    deviceProvider.isRooted = true

    startupChecksService.initChecks().catch(consequence => {
      expect(consequence.name).toBe('rootCheck')
    })
  }))

  it('should show disclaimer modal if the disclaimer has not been accepted yet', async(async () => {
    await storageProvider.set({
      key: 'DISCLAIMER_INITIAL', 
      value: JSON.stringify(false)
    })

    startupChecksService.checks = startupChecksService.checks.map(check => {
      check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
        await check.failureConsequence()
      })

      return check
    })

    await startupChecksService.initChecks().then(() => {
      startupChecksService.checks.forEach(check => {
        if (check.name === 'disclaimerAcceptedCheck') {
          expect(check.failureConsequence).toHaveBeenCalled()
        } else {
          expect(check.failureConsequence).not.toHaveBeenCalled()
        }
      })
    })
  }))

  it('should show the introduction modal if the introduction has not been accepted yet', async(async () => {
    await storageProvider.set({
      key: 'INTRODUCTION_INITIAL', 
      value: JSON.stringify(false)
    })

    startupChecksService.checks = startupChecksService.checks.map(check => {
      check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
        await check.failureConsequence()
      })

      return check
    })

    await startupChecksService.initChecks().then(() => {
      startupChecksService.checks.forEach(check => {
        if (check.name === 'introductionAcceptedCheck') {
          expect(check.failureConsequence).toHaveBeenCalled()
        } else {
          expect(check.failureConsequence).not.toHaveBeenCalled()
        }
      })
    })
  }))

  it('should show the device security modal if device is not secure', async(async () => {
    secureStorage.isSecure = 0

    startupChecksService.checks = startupChecksService.checks.map(check => {
      check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
        await check.failureConsequence()
      })

      return check
    })

    await startupChecksService.initChecks().then(() => {
      startupChecksService.checks.forEach(check => {
        if (check.name === 'deviceSecureCheck') {
          expect(check.failureConsequence).toHaveBeenCalled()
        } else {
          expect(check.failureConsequence).not.toHaveBeenCalled()
        }
      })
    })
  }))

  it('should resolve if everything is ok', async(async () => {
    await storageProvider.set({
      key: 'DISCLAIMER_INITIAL', 
      value: JSON.stringify(true)
    })
    await storageProvider.set({
      key: 'INTRODUCTION_INITIAL', 
      value: JSON.stringify(true)
    })

    secureStorage.isSecure = 1
    deviceProvider.isRooted = false
    deviceProvider.isElectron = false

    startupChecksService.initChecks()
  }))
})
