import { async, TestBed } from '@angular/core/testing'
import { NavController, NavParams, Platform, AlertController, App, LoadingController } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import 'jasmine'
import { SplashScreen } from '@ionic-native/splash-screen'

import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock,
  NavParamsMock,
  DeviceProviderMock,
  AlertControllerMock
} from '../../../test-config/mocks-ionic'
import { NavControllerMock, AppMock, LoadingControllerMock } from 'ionic-mocks'
import { SchemeRoutingProvider } from './scheme-routing'

import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { StorageMock } from '../../../test-config/storage-mock'
import { Storage } from '@ionic/storage'
import { SecureStorageServiceMock } from '../../providers/storage/secure-storage.mock'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { createTranslateLoader } from '../../app/app.module'
import { HttpClient } from '@angular/common/http'

describe('SchemeRoutingProvider Provider', () => {
  let schemeRoutingProvider: SchemeRoutingProvider
  let storageProvider: Storage
  let secureStorage: SecureStorageServiceMock
  let deviceProvider: DeviceProviderMock
  let navController: NavController

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        SchemeRoutingProvider,
        SecretsProvider,
        { provide: App, useClass: AppMock },
        {
          provide: AlertController,
          useValue: AlertControllerMock
        },
        {
          provide: LoadingController,
          useClass: LoadingControllerMock
        },
        { provide: SecureStorageService, useClass: SecureStorageServiceMock },
        { provide: Storage, useClass: StorageMock },
        { provide: NavController, useClass: NavControllerMock },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        TranslateService
      ]
    })
  }))

  beforeEach(() => {
    schemeRoutingProvider = TestBed.get(SchemeRoutingProvider)
    storageProvider = TestBed.get(Storage)
    secureStorage = TestBed.get(SecureStorageService)
    navController = TestBed.get(NavController)
  })

  it('should be created', () => {
    expect(schemeRoutingProvider instanceof SchemeRoutingProvider).toBe(true)
  })

  it('should show alert', async done => {
    await schemeRoutingProvider.showTranslatedAlert('Test', 'Message', [])
    done()
  })

  it('should handle request', async(async () => {
    const text: string = 'test'
    const callback = () => undefined
    try {
      await schemeRoutingProvider.handleNewSyncRequest(navController, text, callback)
    } catch (e) {
      expect(e).toBeDefined()
    }
  }))
})
