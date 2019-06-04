import { Component, ViewChild } from '@angular/core'
import { AlertController, NavController, Platform } from '@ionic/angular'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { PermissionsService, PermissionStatus, PermissionTypes } from '../../services/permissions/permissions.service'
import { ScannerService } from '../../services/scanner/scanner.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-tab-scan',
  templateUrl: './tab-scan.page.html',
  styleUrls: ['./tab-scan.page.scss']
})
export class TabScanPage {
  @ViewChild('scanner')
  public zxingScanner: ZXingScannerComponent
  public availableDevices: MediaDeviceInfo[]
  public selectedDevice: MediaDeviceInfo
  public scannerEnabled = true

  public isBrowser = false

  public hasCameras = false

  public hasCameraPermission = false

  constructor(
    private readonly schemeRouting: SchemeRoutingService,
    private readonly alertCtrl: AlertController,
    private readonly navController: NavController,
    private readonly platform: Platform,
    private readonly secretsProvider: SecretsService,
    private readonly scanner: ScannerService,
    private readonly permissionsProvider: PermissionsService
  ) {
    this.isBrowser = !this.platform.is('cordova')
  }

  public async ionViewWillEnter() {
    if (this.platform.is('cordova')) {
      await this.platform.ready()
      await this.checkCameraPermissionsAndActivate()
    }
  }

  public async requestPermission() {
    await this.permissionsProvider.userRequestsPermissions([PermissionTypes.CAMERA])
    await this.checkCameraPermissionsAndActivate()
  }

  public async checkCameraPermissionsAndActivate() {
    const permission = await this.permissionsProvider.hasCameraPermission()
    if (permission === PermissionStatus.GRANTED) {
      this.hasCameraPermission = true
      this.startScan()
    }
  }

  public ionViewDidEnter() {
    if (!this.platform.is('cordova')) {
      this.hasCameraPermission = true
      this.zxingScanner.camerasNotFound.subscribe((_devices: MediaDeviceInfo[]) => {
        console.error('An error has occurred when trying to enumerate your video-stream-enabled devices.')
      })
      if (this.selectedDevice) {
        // Not the first time that we open scanner
        this.zxingScanner.startScan(this.selectedDevice)
      }
      this.zxingScanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
        this.hasCameras = true
        this.availableDevices = devices
        this.selectedDevice = devices[0]
      })
    }
  }

  public ionViewWillLeave() {
    if (this.platform.is('cordova')) {
      this.scanner.destroy()
    } else {
      (this.zxingScanner as any).resetCodeReader()
    }
  }

  public startScan() {
    if (this.platform.is('cordova')) {
      this.scanner.show()
      this.scanner.scan(
        text => {
          this.checkScan(text).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
        },
        error => {
          console.warn(error)
          this.startScan()
        }
      )
    } else {
      // We don't need to do anything in the browser because it keeps scanning
    }
  }

  public async checkScan(data: string) {
    return this.schemeRouting.handleNewSyncRequest(this.navController, data, () => {
      this.startScan()
    })
  }
}
