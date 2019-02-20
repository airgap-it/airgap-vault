import { BrowserModule } from '@angular/platform-browser'
import { NgModule, RendererFactory2, NgZone } from '@angular/core'
import { IonicApp, IonicModule, Platform } from 'ionic-angular'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'
import { Deeplinks } from '@ionic-native/deeplinks'
import { HttpClientModule } from '@angular/common/http'
import { TranslateModule } from '@ngx-translate/core'
import { MyApp } from './app.component'
import { CameraPreview } from '@ionic-native/camera-preview'
import { Clipboard } from '@ionic-native/clipboard'
import { Diagnostic } from '@ionic-native/diagnostic'
import { AppVersion } from '@ionic-native/app-version'
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
import { StartupChecksProvider } from '../providers/startup-checks/startup-checks.provider'
import { SchemeRoutingProvider } from '../providers/scheme-routing/scheme-routing'
import { ClipboardBrowserProvider } from '../providers/clipboard-browser/clipboard-browser'
import { PermissionsProvider } from '../providers/permissions/permissions'
import { ShareUrlProvider } from '../providers/share-url/share-url'
import { ErrorHandlerProvider } from '../providers/error-handler/error-handler'
import { InteractionProvider } from '../providers/interaction/interaction'
import { DeepLinkProvider } from '../providers/deep-link/deep-link'
import { ProtocolsProvider } from '../providers/protocols/protocols'

@NgModule({
  declarations: [MyApp],
  imports: [
    BrowserModule,
    MaterialIconsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
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
  entryComponents: [MyApp],
  providers: [
    StatusBar,
    SplashScreen,
    AppVersion,
    CameraPreview,
    Deeplinks,
    DeviceMotion,
    Diagnostic,
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
      deps: [Platform, CameraPreview, RendererFactory2, NgZone, PermissionsProvider]
    },
    {
      provide: AudioNativeService,
      useFactory: AudioServiceFactory,
      deps: [Platform, PermissionsProvider]
    },
    {
      provide: GyroscopeNativeService,
      useFactory: GyroscopeServiceFactory,
      deps: [Platform, DeviceMotion]
    },
    {
      provide: Clipboard,
      useFactory: (platform: Platform) => (platform.is('cordova') ? new Clipboard() : new ClipboardBrowserProvider()),
      deps: [Platform]
    },
    DeviceProvider,
    SchemeRoutingProvider,
    PermissionsProvider,
    InteractionProvider,
    ShareUrlProvider,
    ErrorHandlerProvider,
    DeepLinkProvider,
    ProtocolsProvider
  ]
})
export class AppModule {}
