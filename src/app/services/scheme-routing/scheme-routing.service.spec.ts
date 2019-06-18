import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { NavController, Platform } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import { PlatformMock, SplashScreenMock, StatusBarMock } from './../../../../test-config/ionic-mocks'
import { StorageMock } from '../../../../test-config/storage-mock'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { SchemeRoutingService } from './scheme-routing.service'

describe('SchemeRoutingProvider Provider', () => {
  let schemeRoutingService: SchemeRoutingService
  let storageProvider: Storage
  let navController: NavController
  let statusBar: StatusBar

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          SchemeRoutingService,
          { provide: Storage, useClass: StorageMock },
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
    schemeRoutingService = TestBed.get(SchemeRoutingService)
    storageProvider = TestBed.get(Storage)
    statusBar = TestBed.get(StatusBar)
    navController = TestBed.get(NavController)
  })

  it('should be created', () => {
    expect(schemeRoutingService instanceof SchemeRoutingService).toBe(true)
  })

  it('should show alert', async done => {
    await schemeRoutingService.showTranslatedAlert('Test', 'Message', [])
    done()
  })

  it('should throw for invalid URL', async done => {
    const text: string = 'test'
    const callback = () => undefined
    try {
      await schemeRoutingService.handleNewSyncRequest(text, callback)
    } catch (error) {
      if (error.name === "TypeError: Failed to construct 'URL': Invalid URL") {
      }
    }
    done()
  })
})
