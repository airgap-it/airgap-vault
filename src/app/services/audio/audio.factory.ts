import { PermissionsService } from './../permissions/permissions.service'
import { AudioNativeService } from './audio.native.servive'
import { Platform } from '@ionic/angular'
import { AudioBrowserService } from './audio.browser.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

export function AudioServiceFactory(platform: Platform, permissionsProvider: PermissionsService): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new AudioNativeService(platform, permissionsProvider)
  } else {
    return new AudioBrowserService()
  }
}
