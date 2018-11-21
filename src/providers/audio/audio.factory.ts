import { Platform } from 'ionic-angular'
import { AudioBrowserService } from './audio.browser.service'
import { AudioNativeService } from './audio.native.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { PermissionsProvider } from '../permissions/permissions'

export function AudioServiceFactory(platform: Platform, permissionsProvider: PermissionsProvider): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new AudioNativeService(platform, permissionsProvider)
  } else {
    return new AudioBrowserService()
  }
}
