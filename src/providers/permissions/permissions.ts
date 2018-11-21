import { Injectable } from '@angular/core'
import { Diagnostic } from '@ionic-native/diagnostic'
import { Platform, AlertController } from 'ionic-angular'

export enum PermissionStatus {
  GRANTED = 'GRANTED',
  NOT_REQUESTED = 'NOT_REQUESTED',
  DENIED_ALWAYS = 'DENIED_ALWAYS',
  DENIED = 'DENIED',
  UNKNOWN = 'UNKNOWN'
}

export enum PermissionTypes {
  CAMERA = 'CAMERA',
  MICROPHONE = 'MICROPHONE'
}

@Injectable()
export class PermissionsProvider {
  constructor(private platform: Platform, private diagnostic: Diagnostic, private alertCtrl: AlertController) {}

  async hasCameraPermission(): Promise<PermissionStatus> {
    const permission = await this.diagnostic.getCameraAuthorizationStatus(false)
    return this.getPermissionStatus(permission)
  }

  async hasMicrophonePermission(): Promise<PermissionStatus> {
    const permission = await this.diagnostic.getMicrophoneAuthorizationStatus()
    return this.getPermissionStatus(permission)
  }

  async requestPermissions(permissions: PermissionTypes[]): Promise<void> {
    if (this.platform.is('android')) {
      const permissionsToRequest = []
      if (permissions.indexOf(PermissionTypes.CAMERA) >= 0) {
        permissionsToRequest.push(this.diagnostic.permission.CAMERA)
      }
      if (permissions.indexOf(PermissionTypes.MICROPHONE) >= 0) {
        permissionsToRequest.push(this.diagnostic.permission.RECORD_AUDIO)
      }
      await this.diagnostic.requestRuntimePermissions(permissionsToRequest)
    } else if (this.platform.is('ios')) {
      if (permissions.indexOf(PermissionTypes.CAMERA) >= 0) {
        await this.diagnostic.requestCameraAuthorization(false)
      }
      if (permissions.indexOf(PermissionTypes.MICROPHONE) >= 0) {
        await this.diagnostic.requestMicrophoneAuthorization()
      }
    } else {
    }
  }

  /**
   * The user actively wants to give permissions. This means we first check if we
   * can ask him for the permissions natively, otherwise we show an alert with a
   * link to the settings.
   */
  async userRequestsPermissions(permissions: PermissionTypes[]) {
    let canRequestPermission = false
    for (const p of permissions) {
      canRequestPermission = (await this.canAskForPermission(p)) || canRequestPermission
    }
    if (canRequestPermission) {
      this.requestPermissions(permissions)
    } else {
      this.showSettingsAlert()
    }
  }

  showSettingsAlert() {
    this.showAlert('Settings', 'You can enable the missing permissions in the device settings.')
  }

  private async canAskForPermission(permission: PermissionTypes): Promise<boolean> {
    let canAskForPermission = true
    if (this.platform.is('android')) {
      if (permission === PermissionTypes.CAMERA) {
        let permissionStatus = await this.hasCameraPermission()
        canAskForPermission = !(permissionStatus === PermissionStatus.DENIED_ALWAYS)
      } else if (permission === PermissionTypes.MICROPHONE) {
        let permissionStatus = await this.hasMicrophonePermission()
        canAskForPermission = !(permissionStatus === PermissionStatus.DENIED_ALWAYS)
      }
    } else if (this.platform.is('ios')) {
      if (permission === PermissionTypes.CAMERA) {
        let permissionStatus = await this.hasCameraPermission()
        canAskForPermission = !(permissionStatus === PermissionStatus.DENIED)
      } else if (permission === PermissionTypes.MICROPHONE) {
        let permissionStatus = await this.hasMicrophonePermission()
        canAskForPermission = !(permissionStatus === PermissionStatus.DENIED)
      }
    }
    return canAskForPermission
  }

  private async getPermissionStatus(permission: string): Promise<PermissionStatus> {
    if (this.isGranted(permission)) {
      return PermissionStatus.GRANTED
    } else if (this.isNotRequested(permission)) {
      return PermissionStatus.NOT_REQUESTED
    } else if (this.isDeniedAlways(permission)) {
      return PermissionStatus.DENIED_ALWAYS
    } else if (this.isDenied(permission)) {
      return PermissionStatus.DENIED
    } else {
      return PermissionStatus.UNKNOWN
    }
  }

  private showAlert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title,
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Open settings',
          handler: () => {
            this.diagnostic.switchToSettings()
          }
        }
      ]
    })
    alert.present()
  }

  private isGranted(permission: string): boolean {
    return permission === this.diagnostic.permissionStatus.GRANTED || permission === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE
  }

  private isNotRequested(permission: string): boolean {
    return permission === this.diagnostic.permissionStatus.NOT_REQUESTED
  }

  private isDeniedAlways(permission: string): boolean {
    return permission === this.diagnostic.permissionStatus.DENIED_ALWAYS || permission === this.diagnostic.permissionStatus.RESTRICTED
  }

  private isDenied(permission: string): boolean {
    return !(this.isGranted(permission) || this.isNotRequested(permission))
  }
}
