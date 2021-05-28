import {
  AirGapAngularCoreModule,
  AirGapTranslateLoader,
  APP_CONFIG,
  APP_INFO_PLUGIN,
  APP_PLUGIN,
  BARCODE_SCANNER_PLUGIN,
  ClipboardService,
  CLIPBOARD_PLUGIN,
  DeeplinkService,
  PermissionsService,
  PERMISSIONS_PLUGIN,
  QrScannerService,
  SerializerService,
  SPLASH_SCREEN_PLUGIN,
  STATUS_BAR_PLUGIN,
  UiEventService
} from '@airgap/angular-core'
import { AirGapAngularNgRxModule } from '@airgap/angular-ngrx'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'
import { Plugins } from '@capacitor/core'
import { DeviceMotion } from '@ionic-native/device-motion/ngx'
import { Diagnostic } from '@ionic-native/diagnostic/ngx'
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular'
import { IonicStorageModule } from '@ionic/storage-angular'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'
import { Drivers } from '@ionic/storage'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import * as fromRoot from './app.reducers'
import { CAMERA_PREVIEW_PLUGIN, SAPLING_PLUGIN, SECURITY_UTILS_PLUGIN } from './capacitor-plugins/injection-tokens'
import { appConfig } from './config/app-config'
import { DistributionOnboardingPageModule } from './pages/distribution-onboarding/distribution-onboarding.module'
import { IntroductionPageModule } from './pages/introduction/introduction.module'
import { LocalAuthenticationOnboardingPageModule } from './pages/local-authentication-onboarding/local-authentication-onboarding.module'
import { WarningModalPageModule } from './pages/warning-modal/warning-modal.module'
import { AudioServiceFactory } from './services/audio/audio.factory'
import { AudioNativeService } from './services/audio/audio.native.servive'
import { CameraFactory, CameraFactoryDepHolder } from './services/camera/camera.factory'
import { CameraNativeService } from './services/camera/camera.native.service'
import { DeviceService } from './services/device/device.service'
import { EntropyService } from './services/entropy/entropy.service'
import { ErrorHandlerService } from './services/error-handler/error-handler.service'
import { GyroscopeServiceFactory } from './services/gyroscope/gyroscope.factory'
import { GyroscopeNativeService } from './services/gyroscope/gyroscope.native.service'
import { IACService } from './services/iac/iac.service'
import { InteractionService } from './services/interaction/interaction.service'
import { SecretsService } from './services/secrets/secrets.service'
import { SecureStorageFactory, SecureStorageFactoryDepHolder } from './services/secure-storage/secure-storage.factory'
import { SecureStorageService } from './services/secure-storage/secure-storage.service'
import { ShareUrlService } from './services/share-url/share-url.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { VaultStorageService } from './services/storage/storage.service'

export function createTranslateLoader(http: HttpClient): AirGapTranslateLoader {
  return new AirGapTranslateLoader(http, { prefix: './assets/i18n/', suffix: '.json' })
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    StoreModule.forRoot(fromRoot.reducers, {
      metaReducers: fromRoot.metaReducers,
      /* temporary fix for `ERROR TypeError: Cannot freeze array buffer views with elements` */
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false
      }
    }),
    EffectsModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot({
      name: '__airgap_storage',
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.LocalStorage]
    }),
    WarningModalPageModule,
    IntroductionPageModule,
    DistributionOnboardingPageModule,
    LocalAuthenticationOnboardingPageModule,
    AirGapAngularCoreModule,
    AirGapAngularNgRxModule
  ],
  providers: [
    { provide: APP_PLUGIN, useValue: Plugins.App },
    { provide: APP_INFO_PLUGIN, useValue: Plugins.AppInfo },
    { provide: CAMERA_PREVIEW_PLUGIN, useValue: Plugins.CameraPreview },
    { provide: BARCODE_SCANNER_PLUGIN, useValue: Plugins.BarcodeScanner },

    { provide: CLIPBOARD_PLUGIN, useValue: Plugins.Clipboard },
    { provide: PERMISSIONS_PLUGIN, useValue: Plugins.Permissions },
    { provide: SAPLING_PLUGIN, useValue: Plugins.SaplingNative },
    { provide: SECURITY_UTILS_PLUGIN, useValue: Plugins.SecurityUtils },
    { provide: SPLASH_SCREEN_PLUGIN, useValue: Plugins.SplashScreen },
    { provide: STATUS_BAR_PLUGIN, useValue: Plugins.StatusBar },
    { provide: APP_CONFIG, useValue: appConfig },
    Diagnostic,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DeviceMotion,
    AudioNativeService,
    SecretsService,
    SecureStorageService,
    DeviceService,
    CameraNativeService,
    EntropyService,
    GyroscopeNativeService,
    QrScannerService,
    StartupChecksService,
    IACService,
    ClipboardService,
    PermissionsService,
    ShareUrlService,
    ErrorHandlerService,
    InteractionService,
    DeeplinkService,
    SerializerService,
    VaultStorageService,
    UiEventService,
    SecureStorageFactoryDepHolder,
    CameraFactoryDepHolder,
    {
      provide: SecureStorageService,
      useFactory: SecureStorageFactory,
      deps: [SecureStorageFactoryDepHolder]
    },
    {
      provide: CameraNativeService,
      useFactory: CameraFactory,
      deps: [CameraFactoryDepHolder]
    },
    {
      provide: AudioNativeService,
      useFactory: AudioServiceFactory,
      deps: [Platform, PermissionsService]
    },
    {
      provide: GyroscopeNativeService,
      useFactory: GyroscopeServiceFactory,
      deps: [Platform, DeviceMotion]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
