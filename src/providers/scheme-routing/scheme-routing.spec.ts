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

describe('SchemeRoutingProvider Provider', () => {
  let schemeRoutingProvider: SchemeRoutingProvider
  let storageProvider: Storage
  let secureStorage: SecureStorageServiceMock
  let deviceProvider: DeviceProviderMock

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
        { provide: Platform, useClass: PlatformMock }
      ]
    })
  }))

  beforeEach(() => {
    schemeRoutingProvider = TestBed.get(SchemeRoutingProvider)
    storageProvider = TestBed.get(Storage)
    secureStorage = TestBed.get(SecureStorageService)
  })

  it('should be created', () => {
    expect(schemeRoutingProvider instanceof SchemeRoutingProvider).toBe(true)
  })

  it('should show alert', async done => {
    await schemeRoutingProvider.showAlert('Test', 'Message', [])
    done()
  })
})
