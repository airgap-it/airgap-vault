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
import { SecureStorageFactory } from '../../providers/storage/secure-storage.factory'
import { QRCodeModule } from 'angularx-qrcode'
import { WalletMock } from '../../../test-config/wallet-mock'
import { StorageMock } from '../../../test-config/storage-mock'
import { Storage } from '@ionic/storage'
import { SecureStorageServiceMock } from '../../providers/storage/secure-storage.mock'

describe('TransactionSigned Page', () => {

  const ethWallet = new WalletMock().ethWallet
  const ethTransaction = new WalletMock().ethTransaction
  const ethTransaction2 = new WalletMock().ethTransaction2

  const btcWallet = new WalletMock().btcWallet
  const btcTransaction = new WalletMock().btcTransaction

  let fixture: ComponentFixture<TransactionSignedPage>
  let component: TransactionSignedPage

  beforeEach(async(() => {
    WalletMock.injectSecret()
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

  /*
  // Removed because of missing seed
  it('should be able to sign an ethereum transaction', (done) => {
    component.signTransaction(ethTransaction, ethWallet).then(signed => {
      expect(signed.length).toBeGreaterThan(0)
      done()
    })
  })

  it('should correctly generate a broadcast-url for a ethereum transaction', (done) => {
    component.signTransaction(ethTransaction, ethWallet).then(signed => {
      let broadcastUrl = component.broadcastURL(signed)

      // should contain correct url-scheme
      expect(broadcastUrl).toContain('airgap-wallet://broadcast?data=')

      // should include correct payload
      let splits = broadcastUrl.split('data=')
      let payload = JSON.parse(window.atob(splits[1]))

      expect(payload.from).toEqual(['0x4681Df42ca7d5f0E986FFeA979A55c333f5c0a05'])
      expect(payload.to).toEqual(['0x579D75370dd53C59e09E6F51F4D935220D7EEcF8'])
      expect(payload.amount).toEqual('10000000000000')
      expect(payload.fee).toEqual('0')
      expect(payload.protocolIdentifier).toEqual('eth')
      expect(payload.payload).toEqual('f86a808502540be40082520894579d75370dd53c59e09e6f51f4d935220d7eecf88609184e72a0008026a01afc30c8ba210526f70fd5118db16a13ab29c18dee0cda5b46aac8154bfc0240a07b346797feb1a47ee484ad163a99d83b62fabd59bd5bee878d8f68abebceac8b')

      done()
    })
  })

  it('should correctly generate a broadcast-url for a tx prepared by the wallet', (done) => {
    component.signTransaction(ethTransaction2, ethWallet).then(signed => {
      let broadcastUrl = component.broadcastURL(signed)

      // should contain correct url-scheme
      expect(broadcastUrl).toContain('airgap-wallet://broadcast?data=')

      // should include correct payload
      let splits = broadcastUrl.split('data=')
      let payload = JSON.parse(window.atob(splits[1]))

      expect(payload.from).toEqual(['0x4681Df42ca7d5f0E986FFeA979A55c333f5c0a05'])
      expect(payload.to).toEqual(['0x579D75370dd53C59e09E6F51F4D935220D7EEcF8'])
      expect(payload.amount).toEqual('10000000000000')
      expect(payload.fee).toEqual('0')
      expect(payload.protocolIdentifier).toEqual('eth')
      expect(payload.payload).toEqual('f86a038502540be40082520894579d75370dd53c59e09e6f51f4d935220d7eecf88609184e72a0008026a0b6d93a084a0f5ab2792e382cd72e8761dc993a4e88ba5a2e75a5eae6d115f060a0758cde65923396b8acf8ae7a12ad4df7f16c85dc8a64f511f2707651660e27f2')

      done()
    })
  })
  */
})
