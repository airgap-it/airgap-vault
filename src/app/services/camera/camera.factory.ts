import { RendererFactory2 } from '@angular/core'
import { Platform } from '@ionic/angular'

import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { PermissionsService } from './../permissions/permissions.service'
import { CameraBrowserService } from './camera.browser.service'
import { CameraNativeService } from './camera.native.service'

export function CameraFactory(
  platform: Platform,
  rendererFactory: RendererFactory2,
  permissionsService: PermissionsService
): IEntropyGenerator {
  if (platform.is('hybrid')) {
    return new CameraNativeService(platform, rendererFactory, permissionsService)
  } else {
    return new CameraBrowserService()
  }
}
