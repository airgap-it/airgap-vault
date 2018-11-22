import { Platform } from 'ionic-angular'
import { CameraBrowserService } from './camera.browser.service'
import { CameraNativeService } from './camera.native.service'
import { CameraPreview } from '@ionic-native/camera-preview'
import { RendererFactory2, NgZone } from '@angular/core'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { PermissionsProvider } from '../permissions/permissions'

export function CameraFactory(
  platform: Platform,
  cameraPreview: CameraPreview,
  rendererFactory: RendererFactory2,
  ngZone: NgZone,
  permissionsProvider: PermissionsProvider
): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new CameraNativeService(platform, cameraPreview, rendererFactory, permissionsProvider)
  } else {
    return new CameraBrowserService(platform, cameraPreview, rendererFactory, ngZone)
  }
}
