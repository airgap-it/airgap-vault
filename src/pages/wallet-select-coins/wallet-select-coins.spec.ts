import 'jasmine'
import { async, TestBed, ComponentFixture } from '@angular/core/testing'
import { IonicModule, NavController, NavParams, Platform } from 'ionic-angular'
import { WalletSelectCoinsPage } from './wallet-select-coins'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'

import { PlatformMock, StatusBarMock, SplashScreenMock } from '../../../test-config/mocks-ionic'
import { NavControllerMock, NavParamsMock } from 'ionic-mocks'

import { ComponentsModule } from '../../components/components.module'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { SecureStorageFactory } from '../../providers/storage/secure-storage.factory'
import { IonicStorageModule } from '@ionic/storage'
import { By } from '@angular/platform-browser'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { HttpLoaderFactory } from '../../app/app.module'
import { HttpClient } from '@angular/common/http'

describe('Wallet-Select-Coin Component', () => {
  let fixture: ComponentFixture<WalletSelectCoinsPage>
  let component: WalletSelectCoinsPage
  let translate: TranslateService
  let http: HttpTestingController

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WalletSelectCoinsPage],
      imports: [
        IonicModule.forRoot(WalletSelectCoinsPage),
        ComponentsModule,
        IonicStorageModule.forRoot({
          name: '__airgap_storage',
          driverOrder: ['localstorage']
        }),
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
        SecretsProvider,
        {
          provide: SecureStorageService,
          useFactory: SecureStorageFactory,
          deps: [Platform]
        },
        { provide: NavController, useClass: NavControllerMock },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        TranslateService
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WalletSelectCoinsPage)
        component = fixture.componentInstance
      })
  }))

  it('should be created', () => {
    expect(component instanceof WalletSelectCoinsPage).toBe(true)
  })

  it('should not define a protocol by default', () => {
    expect(component.selectedProtocol).toBeUndefined()
    expect(fixture.debugElement.query(By.css('#wallet-type-selector')))
  })

  /*
  it('should not show hd-wallet dropdown if currency does not support it', async(() => {
    fixture.detectChanges()

    let el = fixture.debugElement.nativeElement
    let ethereumRadio = el.querySelector('#eth')

    // click on ethereum
    ethereumRadio.click()

    fixture.whenStable().then(() => {
      console.log(fixture.componentInstance.selectedProtocol)

      expect(fixture.componentInstance.selectedProtocol).toBeDefined()
      expect(fixture.componentInstance.selectedProtocol.identifier).toEqual('eth')

      // eth should not show hd wallets
      let hdWalletSelector = el.querySelector('#wallet-type-selector')
      expect(hdWalletSelector).toBeFalsy()
    })
  }))

  it('should show hd-wallet dropdown if currency supports it', () => {
    fixture.detectChanges()

    let el = fixture.debugElement.nativeElement
    let btcRadio = el.querySelector('#btc')

    // click on ethereum
    btcRadio.click()

    expect(component.selectedProtocol).toBeDefined()
    expect(component.selectedProtocol.identifier).toEqual('btc')

    // eth should not show hd wallets
    let hdWalletSelector = el.querySelector('#wallet-type-selector')
    expect(hdWalletSelector).toBeTruthy()
  })
  */
})
