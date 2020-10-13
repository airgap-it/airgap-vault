import { APP_PLUGIN, ProtocolService, SPLASH_SCREEN_PLUGIN, STATUS_BAR_PLUGIN } from '@airgap/angular-core'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

import { UnitHelper } from './../../test-config/unit-test-helper'
import { AppComponent } from './app.component'
import { NavigationService } from './services/navigation/navigation.service'
import { SecretsService } from './services/secrets/secrets.service'
import { SecureStorageServiceMock } from './services/secure-storage/secure-storage.mock'
import { SecureStorageService } from './services/secure-storage/secure-storage.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { StatusBarPlugin, SplashScreenPlugin, AppPlugin } from '@capacitor/core'
import { SECURITY_UTILS_PLUGIN } from './capacitor-plugins/injection-tokens'
import { SecurityUtilsPlugin } from './capacitor-plugins/definitions'
import { createAppSpy, createSecurityUtilsSpy, createSplashScreenSpy, createStatusBarSpy } from 'test-config/plugins-mocks'
import { IACService } from './services/iac/iac.service'

describe('AppComponent', () => {
  let appSpy: AppPlugin
  let securityUtilsSpy: SecurityUtilsPlugin
  let statusBarSpy: StatusBarPlugin
  let splashScreenSpy: SplashScreenPlugin
  let platformReadySpy: Promise<void>
  let platformSpy: Platform
  // let component: AppComponent
  // let fixture: ComponentFixture<AppComponent>
  let unitHelper: UnitHelper
  beforeEach(() => {
    appSpy = createAppSpy()
    securityUtilsSpy = createSecurityUtilsSpy()
    statusBarSpy = createStatusBarSpy()
    splashScreenSpy = createSplashScreenSpy()
    platformReadySpy = Promise.resolve()
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy })

    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: SecureStorageService, useClass: SecureStorageServiceMock },
          { provide: APP_PLUGIN, useValue: appSpy },
          { provide: SECURITY_UTILS_PLUGIN, useValue: securityUtilsSpy },
          { provide: STATUS_BAR_PLUGIN, useValue: statusBarSpy },
          { provide: SPLASH_SCREEN_PLUGIN, useValue: splashScreenSpy },
          { provide: Platform, useValue: platformSpy },
          StartupChecksService,
          IACService,
          TranslateService,
          ProtocolService,
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
    // fixture = TestBed.createComponent(AppComponent)
    // component = fixture.componentInstance
  })

  it('should create the app', () => {
    const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  })

  // // TODO: Enable when all native parts are mocked and we can run it as "cordova"

  // it('should initialize the app', async () => {
  //   TestBed.createComponent(AppComponent)
  //   expect(platformSpy.ready).toHaveBeenCalled()
  //   await platformReadySpy
  //   expect(statusBarSpy.setStyle).toHaveBeenCalled()
  //   expect(splashScreenSpy.hide).toHaveBeenCalled()
  // })

  // TODO: add more tests!
})
