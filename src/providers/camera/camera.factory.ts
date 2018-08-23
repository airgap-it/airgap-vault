import { Platform } from 'ionic-angular'
import { CameraNativeService } from './camera.native.service'
import { CameraPreview } from '@ionic-native/camera-preview'
import { RendererFactory2, NgZone } from '@angular/core'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { DummyEntropyService } from '../entropy/dummy.entropy.service'

export function CameraFactory(platform: Platform, cameraPreview: CameraPreview, rendererFactory: RendererFactory2, ngZone: NgZone): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new CameraNativeService(platform, cameraPreview, rendererFactory, ngZone)
  } else {
    return new DummyEntropyService()
  }
}
