import { BrowserModule } from '@angular/platform-browser'
import { NgModule, RendererFactory2 } from '@angular/core'
import { IonicApp, IonicModule, Platform } from 'ionic-angular'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'
import { Deeplinks } from '@ionic-native/deeplinks'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { MyApp } from './app.component'
import { CameraPreview } from '@ionic-native/camera-preview'
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TransactionsProvider } from '../providers/transactions/transactions'
import { SecretsProvider } from '../providers/secrets/secrets.provider'
import { SecureStorageService } from '../providers/storage/secure-storage'
import { SecureStorageFactory } from '../providers/storage/secure-storage.factory'
import { DeviceProvider } from '../providers/device/device'
import { CameraNativeService } from '../providers/camera/camera.native.service'
import { CameraFactory } from '../providers/camera/camera.factory'
import { AudioNativeService } from '../providers/audio/audio.native.service'
import { AudioServiceFactory } from '../providers/audio/audio.factory'
import { EntropyService } from '../providers/entropy/entropy.service'
import { GyroscopeNativeService } from '../providers/gyroscope/gyroscope.native.service'
import { GyroscopeServiceFactory } from '../providers/gyroscope/gyroscope.factory'
import { ComponentsModule } from '../components/components.module'
import { PagesModule } from '../pages/pages.module'
import { ScannerProvider } from '../providers/scanner/scanner'
import { IonicStorageModule } from '@ionic/storage'
import { DeviceMotion } from '@ionic-native/device-motion'
import { AirGapSchemeProvider } from '../providers/scheme/scheme.service'
import { StartupChecksProvider } from '../providers/startup-checks/startup-checks.provider';
import { SchemeRoutingProvider } from '../providers/scheme-routing/scheme-routing';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    MaterialIconsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true
    }),
    ComponentsModule,
    PagesModule,
    IonicStorageModule.forRoot({
      name: '__airgap_storage',
      driverOrder: ['sqlite', 'localstorage']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    CameraPreview,
    Deeplinks,
    DeviceMotion,
    AndroidPermissions,
    HttpClientModule,
    TransactionsProvider,
    SecretsProvider,
    EntropyService,
    StartupChecksProvider,
    ScannerProvider,
    {
      provide: SecureStorageService,
      useFactory: SecureStorageFactory,
      deps: [Platform]
    },
    {
      provide: CameraNativeService,
      useFactory: CameraFactory,
      deps: [Platform, CameraPreview, RendererFactory2]
    },
    {
      provide: AudioNativeService,
      useFactory: AudioServiceFactory,
      deps: [Platform]
    },
    {
      provide: GyroscopeNativeService,
      useFactory: GyroscopeServiceFactory,
      deps: [Platform, DeviceMotion]
    },
    DeviceProvider,
    AirGapSchemeProvider,
    SchemeRoutingProvider
  ]
})
export class AppModule {
}
