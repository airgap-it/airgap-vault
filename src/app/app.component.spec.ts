import { UnitHelper } from './../../test-config/unit-test-helper'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { TestBed, ComponentFixture } from '@angular/core/testing'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { Platform } from '@ionic/angular'

import { AppComponent } from './app.component'
import { Deeplinks } from '@ionic-native/deeplinks/ngx'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { SchemeRoutingService } from './services/scheme-routing/scheme-routing.service'
import { TranslateService } from '@ngx-translate/core'
import { ProtocolsService } from './services/protocols/protocols.service'
import { SecretsService } from './services/secrets/secrets.service'
import { NavigationService } from './services/navigation/navigation.service'

describe('AppComponent', () => {
  let statusBarSpy, splashScreenSpy, platformReadySpy, platformSpy
  let component: AppComponent
  let fixture: ComponentFixture<AppComponent>
  let unitHelper: UnitHelper
  beforeEach(() => {
    statusBarSpy = jasmine.createSpyObj('StatusBar', ['styleDefault'])
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide'])
    platformReadySpy = Promise.resolve()
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy })

    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: StatusBar, useValue: statusBarSpy },
          { provide: SplashScreen, useValue: splashScreenSpy },
          { provide: Platform, useValue: platformSpy },
          Deeplinks,
          StartupChecksService,
          SchemeRoutingService,
          TranslateService,
          ProtocolsService,
          SecretsService,
          NavigationService
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    localStorage.clear()
    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  })

  // // TODO: Enable when all native parts are mocked and we can run it as "cordova"

  // it('should initialize the app', async () => {
  //   TestBed.createComponent(AppComponent)
  //   expect(platformSpy.ready).toHaveBeenCalled()
  //   await platformReadySpy
  //   expect(statusBarSpy.styleDefault).toHaveBeenCalled()
  //   expect(splashScreenSpy.hide).toHaveBeenCalled()
  // })

  // TODO: add more tests!
})
