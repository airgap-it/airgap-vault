import { CameraPreview } from '@ionic-native/camera-preview/ngx'
import { PermissionsService } from './../permissions/permissions.service'
import { Platform } from '@ionic/angular'
import { CameraNativeService } from './camera.native.service'
import { RendererFactory2 } from '@angular/core'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { CameraBrowserService } from './camera.browser.service'

export function CameraFactory(
  platform: Platform,
  cameraPreview: CameraPreview,
  rendererFactory: RendererFactory2,
  permissionsProvider: PermissionsService
): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new CameraNativeService(platform, cameraPreview, rendererFactory, permissionsProvider)
  } else {
    return new CameraBrowserService()
  }
}
