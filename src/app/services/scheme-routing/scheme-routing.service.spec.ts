import { TestBed } from '@angular/core/testing'
import { Platform } from '@ionic/angular'

import { StorageMock } from '../../../../test-config/storage-mock'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { StorageService } from '../storage/storage.service'

import { PlatformMock } from './../../../../test-config/ionic-mocks'
import { SchemeRoutingService } from './scheme-routing.service'
import { STATUS_BAR_PLUGIN, SPLASH_SCREEN_PLUGIN, SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { createSecurityUtilsSpy, StatusBarMock, SplashScreenMock } from 'test-config/plugins-mocks'

describe('SchemeRoutingService Service', () => {
  let securityUtilsSpy: SecurityUtilsPlugin
  let schemeRoutingService: SchemeRoutingService
  // let storageService: StorageService
  // let navController: NavController
  // let statusBar: StatusBarPlugin

  let unitHelper: UnitHelper
  beforeEach(() => {
    securityUtilsSpy = createSecurityUtilsSpy()
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          SchemeRoutingService,
          { provide: StorageService, useClass: StorageMock },
          { provide: SECURITY_UTILS_PLUGIN, useValue: securityUtilsSpy },
          { provide: STATUS_BAR_PLUGIN, useClass: StatusBarMock },
          { provide: SPLASH_SCREEN_PLUGIN, useClass: SplashScreenMock },
          { provide: Platform, useClass: PlatformMock }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    schemeRoutingService = TestBed.get(SchemeRoutingService)
    // storageService = TestBed.get(StorageService)
    // statusBar = TestBed.get(STATUS_BAR_PLUGIN)
    // navController = TestBed.get(NavController)
  })

  it('should be created', () => {
    expect(schemeRoutingService instanceof SchemeRoutingService).toBe(true)
  })

  it('should show alert', async (done) => {
    await schemeRoutingService.showTranslatedAlert('Test', 'Message', [])
    done()
  })

  it('should throw for invalid URL', async (done) => {
    // TODO: Fix this test. Currently errors are caught inside "handleNewSyncRequest".
    const text: string = 'test'
    const callback = () => undefined
    try {
      await schemeRoutingService.handleNewSyncRequest(text, callback)
    } catch (error) {
      if (error.name === "TypeError: Failed to construct 'URL': Invalid URL") {
        //
      }
    }
    done()
  })
})
