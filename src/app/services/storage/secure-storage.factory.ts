import { SecureStorageService } from './storage.service'
import { Platform } from '@ionic/angular'
import { SecureStorageServiceMock } from './secure-storage.mock'

export function SecureStorageFactory(platform: Platform) {
  if (platform.is('cordova')) {
    return new SecureStorageService()
  } else {
    return new SecureStorageServiceMock()
  }
}
