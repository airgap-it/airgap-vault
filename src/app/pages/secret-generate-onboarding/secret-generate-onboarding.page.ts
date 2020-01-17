import { Component } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SettingsKey, StorageService } from '../../services/storage/storage.service'

@Component({
  selector: 'airgap-secret-generate-onboarding',
  templateUrl: './secret-generate-onboarding.page.html',
  styleUrls: ['./secret-generate-onboarding.page.scss']
})
export class SecretGenerateOnboardingPage {
  constructor(private readonly navigationService: NavigationService, private readonly storageService: StorageService) {}

  public async continue(): Promise<void> {
    await this.storageService.set(SettingsKey.DISCLAIMER_GENERATE_INITIAL, true)
    const permissionsGranted = await this.askPermissions()

    if (permissionsGranted) {
      this.navigationService.route('secret-generate').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      // TODO: handle permission denial
      console.log()
    }
  }

  private async askPermissions(): Promise<boolean> {
    // iOS 13 requires an additional permission for device motion events
    const deviceMotionPermissionGranted = await this.askDeviceMotionPermission()

    return deviceMotionPermissionGranted
  }

  private async askDeviceMotionPermission(): Promise<boolean> {
    // a proper function should be available if the permission request is required, 
    // otherwise permission should be treated as granted by default
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionStatus = await (DeviceMotionEvent as any).requestPermission()
        return permissionStatus === 'granted'
      } catch (error) {
        // TODO: inform the user of an error
        console.log(error)
        return false
      }
    } else {
      return true
    }
  }
}
