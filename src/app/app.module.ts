import { FeeConverterPipe } from './../app/pipes/fee-converter/fee-converter.pipe'
import { AmountConverterPipe } from './../app/pipes/amount-converter/amount-converter.pipe'
import { CameraPreview } from '@ionic-native/camera-preview'
import { ProtocolsService } from './services/protocols/protocols.service'
import { DeepLinkService } from './services/deep-link/deep-link.service'
import { InteractionService } from './services/interaction/interaction.service'
import { ErrorHandlerService } from './services/error-handler/error-handler.service'
import { ShareUrlService } from './services/share-url/share-url.service'
import { PermissionsService } from './services/permissions/permissions.service'
import { ClipboardService } from './services/clipboard/clipboard.service'
import { SchemeRoutingService } from './services/scheme-routing/scheme-routing.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { ScannerService } from './services/scanner/scanner.service'
import { GyroscopeNativeService } from './services/gyroscope/gyroscope.native.service'
import { EntropyService } from './services/entropy/entropy.service'
import { CameraNativeService } from './services/camera/camera.native.service'
import { DeviceService } from './services/device/device.service'
import { SecureStorageService } from './services/storage/storage.service'
import { SecretsService } from './services/secrets/secrets.service'
import { AudioNativeService } from './services/audio/audio.native.servive'
import { NgModule, RendererFactory2 } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'

import { CameraFactory } from './services/camera/camera.factory'
import { AudioServiceFactory } from './services/audio/audio.factory'
import { GyroscopeServiceFactory } from './services/gyroscope/gyroscope.factory'

import { IonicStorageModule } from '@ionic/storage'
import { DeviceMotion } from '@ionic-native/device-motion'
import { SecureStorageFactory } from './services/storage/secure-storage.factory'

@NgModule({
  declarations: [AppComponent, AmountConverterPipe, FeeConverterPipe],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
    ProtocolsService,
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
