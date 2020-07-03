import { RendererFactory2, Injectable, Inject } from '@angular/core'
import { Platform } from '@ionic/angular'

import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { PermissionsService } from './../permissions/permissions.service'
import { CameraBrowserService } from './camera.browser.service'
import { CameraNativeService } from './camera.native.service'
import { CAMERA_PREVIEW_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { CameraPreviewPlugin } from 'src/app/capacitor-plugins/definitions'

@Injectable()
export class CameraFactoryDepHolder {
  constructor(
    readonly platform: Platform,
    readonly rendererFactory: RendererFactory2,
    readonly permissionsService: PermissionsService,
    @Inject(CAMERA_PREVIEW_PLUGIN) readonly cameraPreview: CameraPreviewPlugin
  ) {}
}

export function CameraFactory(depHolder: CameraFactoryDepHolder): IEntropyGenerator {
  if (depHolder.platform.is('hybrid')) {
    return new CameraNativeService(depHolder.platform, depHolder.rendererFactory, depHolder.permissionsService, depHolder.cameraPreview)
  } else {
    return new CameraBrowserService()
  }
}
