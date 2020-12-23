import { STATUS_BAR_PLUGIN, SPLASH_SCREEN_PLUGIN } from '@airgap/angular-core'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { ModalController, NavController, NavParams, Platform } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import {
  DeviceProviderMock,
  ModalControllerMock,
  NavControllerMock,
  NavParamsMock,
  PlatformMock
} from '../../../../test-config/ionic-mocks'
import { StorageMock } from '../../../../test-config/storage-mock'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { DeviceService } from '../device/device.service'
import { SecretsService } from '../secrets/secrets.service'
import { SecureStorageServiceMock } from '../secure-storage/secure-storage.mock'
import { SecureStorageService } from '../secure-storage/secure-storage.service'

import { StartupChecksService } from './startup-checks.service'
import { StatusBarMock, SplashScreenMock } from 'test-config/plugins-mocks'

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

  it(
    'should show root modal if device is rooted',
    waitForAsync(() => {
      deviceProvider.isRooted = true

      startupChecksService.initChecks().catch((consequence) => {
        expect(consequence.name).toBe('rootCheck')
      })
    })
  )

  it(
    'should show disclaimer modal if the disclaimer has not been accepted yet',
    waitForAsync(async () => {
      await storageProvider.set('DISCLAIMER_INITIAL', false)

      startupChecksService.checks = startupChecksService.checks.map((check) => {
        check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
          await check.failureConsequence()
        })

        return check
      })

      await startupChecksService.initChecks().then(() => {
        startupChecksService.checks.forEach((check) => {
          if (check.name === 'disclaimerAcceptedCheck') {
            expect(check.failureConsequence).toHaveBeenCalled()
          } else {
            expect(check.failureConsequence).not.toHaveBeenCalled()
          }
        })
      })
    })
  )

  it(
    'should show the introduction modal if the introduction has not been accepted yet',
    waitForAsync(async () => {
      await storageProvider.set('INTRODUCTION_INITIAL', false)

      startupChecksService.checks = startupChecksService.checks.map((check) => {
        check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
          await check.failureConsequence()
        })

        return check
      })

      await startupChecksService.initChecks().then(() => {
        startupChecksService.checks.forEach((check) => {
          if (check.name === 'introductionAcceptedCheck') {
            expect(check.failureConsequence).toHaveBeenCalled()
          } else {
            expect(check.failureConsequence).not.toHaveBeenCalled()
          }
        })
      })
    })
  )

  it(
    'should show the device security modal if device is not secure',
    waitForAsync(async () => {
      secureStorage.isSecure = 0

      startupChecksService.checks = startupChecksService.checks.map((check) => {
        check.failureConsequence = jasmine.createSpy('failureConsequence', async () => {
          await check.failureConsequence()
        })

        return check
      })

      await startupChecksService.initChecks().then(() => {
        startupChecksService.checks.forEach((check) => {
          if (check.name === 'deviceSecureCheck') {
            expect(check.failureConsequence).toHaveBeenCalled()
          } else {
            expect(check.failureConsequence).not.toHaveBeenCalled()
          }
        })
      })
    })
  )

  it(
    'should resolve if everything is ok',
    waitForAsync(async () => {
      await storageProvider.set('DISCLAIMER_INITIAL', true)
      await storageProvider.set('INTRODUCTION_INITIAL', true)

      secureStorage.isSecure = 1
      deviceProvider.isRooted = false
      deviceProvider.isElectron = false

      startupChecksService.initChecks()
    })
  )
})
