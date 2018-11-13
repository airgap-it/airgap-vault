import { Platform } from 'ionic-angular'
import { AudioBrowserService } from './audio.browser.service'
import { AudioNativeService } from './audio.native.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

export function AudioServiceFactory(platform: Platform): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new AudioNativeService(platform)
  } else {
    return new AudioBrowserService()
  }
}
