import { Platform } from 'ionic-angular'
import { SecureStorageServiceMock } from './secure-storage.mock'
import { SecureStorageService } from './secure-storage'

export function SecureStorageFactory(platform: Platform) {
  if (platform.is('cordova')) {
    return new SecureStorageService()
  } else {
    return new SecureStorageServiceMock()
  }
}
