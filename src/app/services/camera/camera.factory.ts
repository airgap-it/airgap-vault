import { RendererFactory2 } from '@angular/core'
import { CameraPreview } from '@ionic-native/camera-preview/ngx'
import { Platform } from '@ionic/angular'

import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { PermissionsService } from './../permissions/permissions.service'
import { CameraBrowserService } from './camera.browser.service'
import { CameraNativeService } from './camera.native.service'

export function CameraFactory(
  platform: Platform,
  cameraPreview: CameraPreview,
  rendererFactory: RendererFactory2,
  permissionsService: PermissionsService
): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new CameraNativeService(platform, cameraPreview, rendererFactory, permissionsService)
  } else {
    return new CameraBrowserService()
  }
}
