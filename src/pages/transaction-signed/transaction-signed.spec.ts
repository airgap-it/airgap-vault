import { async, TestBed, ComponentFixture } from '@angular/core/testing'
import { IonicModule, NavController, NavParams, Platform } from 'ionic-angular'
import { TransactionSignedPage } from './transaction-signed'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'

import { PlatformMock, StatusBarMock, SplashScreenMock, NavParamsMock } from '../../../test-config/mocks-ionic'
import { NavControllerMock } from 'ionic-mocks'

import { ComponentsModule } from '../../components/components.module'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { QRCodeModule } from 'angularx-qrcode'
import { WalletMock } from '../../../test-config/wallet-mock'
import { StorageMock } from '../../../test-config/storage-mock'
import { Storage } from '@ionic/storage'
import { SecureStorageServiceMock } from '../../providers/storage/secure-storage.mock'

describe('TransactionSigned Page', () => {

  const ethWallet = new WalletMock().ethWallet
  const ethTransaction = new WalletMock().ethTransaction

  let fixture: ComponentFixture<TransactionSignedPage>
  let component: TransactionSignedPage

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
        QRCodeModule
      ],
      providers: [
        SecretsProvider,
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

  beforeEach((done) => {
    fixture = TestBed.createComponent(TransactionSignedPage)
    component = fixture.componentInstance
    fixture.detectChanges()

    TestBed.get(SecretsProvider).currentSecretsList.asObservable().subscribe(value => {
      done()
    })
  })

  it('should be created', () => {
    expect(component instanceof TransactionSignedPage).toBe(true)
  })
})
