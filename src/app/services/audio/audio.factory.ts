import { Platform } from '@ionic/angular'

import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { PermissionsService } from './../permissions/permissions.service'
import { AudioBrowserService } from './audio.browser.service'
import { AudioNativeService } from './audio.native.servive'

export function AudioServiceFactory(platform: Platform, permissionsProvider: PermissionsService): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new AudioNativeService(platform, permissionsProvider)
  } else {
    return new AudioBrowserService()
  }
}
