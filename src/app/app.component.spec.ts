import { APP_PLUGIN, CLIPBOARD_PLUGIN, FILESYSTEM_PLUGIN, IsolatedModulesPlugin, ISOLATED_MODULES_PLUGIN, ProtocolService, SPLASH_SCREEN_PLUGIN, STATUS_BAR_PLUGIN, ZipPlugin, ZIP_PLUGIN } from '@airgap/angular-core'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AppPlugin } from '@capacitor/app'
import { ClipboardPlugin } from '@capacitor/clipboard'
import { FilesystemPlugin } from '@capacitor/filesystem'
import { SplashScreenPlugin } from '@capacitor/splash-screen'
import { StatusBarPlugin } from '@capacitor/status-bar'
import { FilePickerPlugin } from '@capawesome/capacitor-file-picker'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import {
  createAppSpy,
  createClipboardSpy,
  createFilePickerSpy,
  createFilesystemSpy,
  createIsolatedModulesSpy,
  createSaplingSpy,
  createSecurityUtilsSpy,
  createSplashScreenSpy,
  createStatusBarSpy,
  createZipSpy
} from 'test-config/plugins-mocks'

import { UnitHelper } from './../../test-config/unit-test-helper'
import { AppComponent } from './app.component'
import { SaplingNativePlugin, SecurityUtilsPlugin } from './capacitor-plugins/definitions'
import { FILE_PICKER_PLUGIN, SAPLING_PLUGIN, SECURITY_UTILS_PLUGIN } from './capacitor-plugins/injection-tokens'
import { IACService } from './services/iac/iac.service'
import { NavigationService } from './services/navigation/navigation.service'
import { SecretsService } from './services/secrets/secrets.service'
import { SecureStorageServiceMock } from './services/secure-storage/secure-storage.mock'
import { SecureStorageService } from './services/secure-storage/secure-storage.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'

describe('AppComponent', () => {
  let appSpy: AppPlugin
  let saplingSpy: SaplingNativePlugin
  let securityUtilsSpy: SecurityUtilsPlugin
  let statusBarSpy: StatusBarPlugin
  let splashScreenSpy: SplashScreenPlugin
  let clipboardSpy: ClipboardPlugin
  let filesystemSpy: FilesystemPlugin
  let zipSpy: ZipPlugin
  let isolatedModulesSpy: IsolatedModulesPlugin
  let filePickerSpy: FilePickerPlugin
  let platformReadySpy: Promise<void>
  let platformSpy: Platform
  // let component: AppComponent
  // let fixture: ComponentFixture<AppComponent>
  let unitHelper: UnitHelper
  beforeEach(() => {
    appSpy = createAppSpy()
    saplingSpy = createSaplingSpy()
    securityUtilsSpy = createSecurityUtilsSpy()
    statusBarSpy = createStatusBarSpy()
    splashScreenSpy = createSplashScreenSpy()
    clipboardSpy = createClipboardSpy()
    filesystemSpy = createFilesystemSpy()
    zipSpy = createZipSpy()
    isolatedModulesSpy = createIsolatedModulesSpy()
    filePickerSpy = createFilePickerSpy()
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
          { provide: SAPLING_PLUGIN, useValue: saplingSpy },
          { provide: SECURITY_UTILS_PLUGIN, useValue: securityUtilsSpy },
          { provide: STATUS_BAR_PLUGIN, useValue: statusBarSpy },
          { provide: SPLASH_SCREEN_PLUGIN, useValue: splashScreenSpy },
          { provide: CLIPBOARD_PLUGIN, useValue: clipboardSpy },
          { provide: FILESYSTEM_PLUGIN, useValue: filesystemSpy },
          { provide: ZIP_PLUGIN, useValue: zipSpy },
          { provide: ISOLATED_MODULES_PLUGIN, useValue: isolatedModulesSpy },
          { provide: FILE_PICKER_PLUGIN, useValue: filePickerSpy },
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
