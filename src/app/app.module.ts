import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'
import { Plugins } from '@capacitor/core'

import { DeviceMotion } from '@ionic-native/device-motion/ngx'
import { Diagnostic } from '@ionic-native/diagnostic/ngx'
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular'
import { IonicStorageModule } from '@ionic/storage'
import { TranslateModule } from '@ngx-translate/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DistributionOnboardingPageModule } from './pages/distribution-onboarding/distribution-onboarding.module'
import { IntroductionPageModule } from './pages/introduction/introduction.module'
import { LocalAuthenticationOnboardingPageModule } from './pages/local-authentication-onboarding/local-authentication-onboarding.module'
import { WarningModalPageModule } from './pages/warning-modal/warning-modal.module'
import { AudioServiceFactory } from './services/audio/audio.factory'
import { AudioNativeService } from './services/audio/audio.native.servive'
import { CameraFactory, CameraFactoryDepHolder } from './services/camera/camera.factory'
import { CameraNativeService } from './services/camera/camera.native.service'
import { ClipboardService } from './services/clipboard/clipboard.service'
import { DeepLinkService } from './services/deep-link/deep-link.service'
import { DeviceService } from './services/device/device.service'
import { EntropyService } from './services/entropy/entropy.service'
import { ErrorHandlerService } from './services/error-handler/error-handler.service'
import { GyroscopeServiceFactory } from './services/gyroscope/gyroscope.factory'
import { GyroscopeNativeService } from './services/gyroscope/gyroscope.native.service'
import { InteractionService } from './services/interaction/interaction.service'
import { PermissionsService } from './services/permissions/permissions.service'
import { ProtocolsService } from './services/protocols/protocols.service'
import { ScannerService } from './services/scanner/scanner.service'
import { SchemeRoutingService } from './services/scheme-routing/scheme-routing.service'
import { SecretsService } from './services/secrets/secrets.service'
import { SecureStorageFactory, SecureStorageFactoryDepHolder } from './services/secure-storage/secure-storage.factory'
import { SecureStorageService } from './services/secure-storage/secure-storage.service'
import { SerializerService } from './services/serializer/serializer.service'
import { ShareUrlService } from './services/share-url/share-url.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { StorageService } from './services/storage/storage.service'

import {
  APP_PLUGIN,
  APP_INFO_PLUGIN,
  CLIPBOARD_PLUGIN,
  SPLASH_SCREEN_PLUGIN,
  STATUS_BAR_PLUGIN,
  CAMERA_PREVIEW_PLUGIN,
  SECURITY_UTILS_PLUGIN
} from './capacitor-plugins/injection-tokens'
import { AlertService } from './services/alert/alert.service'

const { App, AppInfo, CameraPreview, Clipboard, SecurityUtils, SplashScreen, StatusBar } = Plugins

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    TranslateModule.forRoot(),
    IonicStorageModule.forRoot({
      name: '__airgap_storage',
      driverOrder: ['sqlite', 'localstorage']
    }),
    WarningModalPageModule,
    IntroductionPageModule,
    DistributionOnboardingPageModule,
    LocalAuthenticationOnboardingPageModule
  ],
  providers: [
    { provide: APP_PLUGIN, useValue: App },
    { provide: APP_INFO_PLUGIN, useValue: AppInfo },
    { provide: CAMERA_PREVIEW_PLUGIN, useValue: CameraPreview },
    { provide: CLIPBOARD_PLUGIN, useValue: Clipboard },
    { provide: SECURITY_UTILS_PLUGIN, useValue: SecurityUtils },
    { provide: SPLASH_SCREEN_PLUGIN, useValue: SplashScreen },
    { provide: STATUS_BAR_PLUGIN, useValue: StatusBar },
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
    ScannerService,
    StartupChecksService,
    SchemeRoutingService,
    ClipboardService,
    PermissionsService,
    ShareUrlService,
    ErrorHandlerService,
    InteractionService,
    DeepLinkService,
    AlertService,
    ProtocolsService,
    SerializerService,
    StorageService,
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
