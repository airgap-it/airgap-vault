import { Platform } from '@ionic/angular'

import { SecureStorageServiceMock } from './secure-storage.mock'
import { SecureStorageService } from './secure-storage.service'

export function SecureStorageFactory(platform: Platform) {
  if (platform.is('hybrid')) {
    return new SecureStorageService()
  } else {
    return new SecureStorageServiceMock()
  }
}
