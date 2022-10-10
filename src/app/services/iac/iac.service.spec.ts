import { TestBed } from '@angular/core/testing'

import { IACService } from './iac.service'

import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { STATUS_BAR_PLUGIN, SPLASH_SCREEN_PLUGIN, APP_PLUGIN, CLIPBOARD_PLUGIN, ISOLATED_PROTOCOL_PLUGIN, WebIsolatedProtocol } from '@airgap/angular-core'
import { ModalController, NavController, NavParams, Platform } from '@ionic/angular'
import {
  ClipboardMock,
  DeviceProviderMock,
  ModalControllerMock,
  NavControllerMock,
  NavParamsMock,
  PlatformMock
} from 'test-config/ionic-mocks'
import { StatusBarMock, SplashScreenMock, createAppSpy } from 'test-config/plugins-mocks'
import { StorageMock } from 'test-config/storage-mock'
import { DeviceService } from '../device/device.service'
import { SecretsService } from '../secrets/secrets.service'
import { SecureStorageServiceMock } from '../secure-storage/secure-storage.mock'
import { SecureStorageService } from '../secure-storage/secure-storage.service'
import { StartupChecksService } from '../startup-checks/startup-checks.service'

describe('IACService', () => {
  let service: IACService

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
          { provide: APP_PLUGIN, useValue: createAppSpy() },
          { provide: STATUS_BAR_PLUGIN, useClass: StatusBarMock },
          { provide: SPLASH_SCREEN_PLUGIN, useClass: SplashScreenMock },
          { provide: CLIPBOARD_PLUGIN, useClass: ClipboardMock },
          { provide: ISOLATED_PROTOCOL_PLUGIN, useValue: new WebIsolatedProtocol() },
          { provide: Platform, useClass: PlatformMock }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    service = TestBed.get(IACService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
