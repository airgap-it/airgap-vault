import { NgModule, RendererFactory2 } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'
import { AppVersion } from '@ionic-native/app-version/ngx'
import { CameraPreview } from '@ionic-native/camera-preview/ngx'
import { Clipboard } from '@ionic-native/clipboard/ngx'
import { Deeplinks } from '@ionic-native/deeplinks/ngx'
import { DeviceMotion } from '@ionic-native/device-motion/ngx'
import { Diagnostic } from '@ionic-native/diagnostic/ngx'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
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
import { CameraFactory } from './services/camera/camera.factory'
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
import { ShareUrlService } from './services/share-url/share-url.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { SecureStorageFactory } from './services/storage/secure-storage.factory'
import { SecureStorageService } from './services/storage/storage.service'
import { SerializerService } from './services/serializer/serializer.service'

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
    AppVersion,
    Clipboard,
    Deeplinks,
    Diagnostic,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AudioNativeService,
    SecretsService,
    SecureStorageService,
    DeviceService,
    CameraNativeService,
    CameraPreview,
    EntropyService,
    GyroscopeNativeService,
    ScannerService,
    StartupChecksService,
    DeviceMotion,
    SchemeRoutingService,
    ClipboardService,
    PermissionsService,
    ShareUrlService,
    ErrorHandlerService,
    InteractionService,
    DeepLinkService,
    ProtocolsService,
    SerializerService,
    {
      provide: SecureStorageService,
      useFactory: SecureStorageFactory,
      deps: [Platform]
    },
    {
      provide: CameraNativeService,
      useFactory: CameraFactory,
      deps: [Platform, CameraPreview, RendererFactory2, PermissionsService]
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
