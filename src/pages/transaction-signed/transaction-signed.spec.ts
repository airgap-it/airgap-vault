import 'jasmine'
import { async, TestBed, ComponentFixture } from '@angular/core/testing'
import { IonicModule, NavController, NavParams, Platform } from 'ionic-angular'
import { QRCodeModule } from 'angularx-qrcode'
import { TransactionSignedPage } from './transaction-signed'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { Clipboard } from '@ionic-native/clipboard'

import { PlatformMock, StatusBarMock, SplashScreenMock, NavParamsMock } from '../../../test-config/mocks-ionic'
import { NavControllerMock } from 'ionic-mocks'

import { ComponentsModule } from '../../components/components.module'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { WalletMock } from '../../../test-config/wallet-mock'
import { StorageMock } from '../../../test-config/storage-mock'
import { Storage } from '@ionic/storage'
import { SecureStorageServiceMock } from '../../providers/storage/secure-storage.mock'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpLoaderFactory } from '../../app/app.module'
import { HttpClient } from '@angular/common/http'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ClipboardProvider } from '../../providers/clipboard/clipboard'

describe('TransactionSigned Page', () => {
  const ethWallet = new WalletMock().ethWallet
  const ethTransaction = new WalletMock().ethTransaction

  let fixture: ComponentFixture<TransactionSignedPage>
  let component: TransactionSignedPage
  let translate: TranslateService
  let http: HttpTestingController

  beforeEach(async(() => {
    NavParamsMock.setParams({
      transaction: ethTransaction,
      wallet: ethWallet
    })
    TestBed.configureTestingModule({
      declarations: [TransactionSignedPage],
      imports: [
        IonicModule.forRoot(TransactionSignedPage),
        ComponentsModule,
        QRCodeModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        Clipboard,
        ClipboardProvider,
        SecretsProvider,
        { provide: SecureStorageService, useClass: SecureStorageServiceMock },
        { provide: Storage, useClass: StorageMock },
        { provide: NavController, useClass: NavControllerMock },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        TranslateService
      ]
    }).compileComponents()
  }))

  beforeEach(done => {
    fixture = TestBed.createComponent(TransactionSignedPage)
    component = fixture.componentInstance
    fixture.detectChanges()

    TestBed.get(SecretsProvider)
      .currentSecretsList.asObservable()
      .subscribe(value => {
        done()
      })
  })

  it('should be created', () => {
    expect(component instanceof TransactionSignedPage).toBe(true)
  })
})
