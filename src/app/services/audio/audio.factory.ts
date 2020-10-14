import { PermissionsService } from '@airgap/angular-core'
import { Platform } from '@ionic/angular'

import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { AudioBrowserService } from './audio.browser.service'
import { AudioNativeService } from './audio.native.servive'

export function AudioServiceFactory(platform: Platform, permissionsService: PermissionsService): IEntropyGenerator {
  if (platform.is('hybrid')) {
    return new AudioNativeService(platform, permissionsService)
  } else {
    return new AudioBrowserService()
  }
}
