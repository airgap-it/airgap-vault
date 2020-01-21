import { Platform } from '@ionic/angular'

import { SecureStorageServiceMock } from './secure-storage.mock'
import { SecureStorageService } from './secure-storage.service'
import { Injectable, Inject } from '@angular/core'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'

@Injectable()
export class SecureStorageFactoryDepHolder {
  constructor(readonly platform: Platform, @Inject(SECURITY_UTILS_PLUGIN) readonly securityUtils: SecurityUtilsPlugin) {}
}

export function SecureStorageFactory(depHolder: SecureStorageFactoryDepHolder) {
  if (depHolder.platform.is('hybrid')) {
    return new SecureStorageService(depHolder.securityUtils)
  } else {
    return new SecureStorageServiceMock()
  }
}
