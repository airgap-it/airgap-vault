import { Component, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { first } from 'rxjs/operators'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { PermissionsService, PermissionStatus, PermissionTypes } from '../../services/permissions/permissions.service'
import { ScannerService } from '../../services/scanner/scanner.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'

@Component({
  selector: 'airgap-tab-scan',
  templateUrl: './tab-scan.page.html',
  styleUrls: ['./tab-scan.page.scss']
})
export class TabScanPage {
  @ViewChild('scanner', { static: false })
  public zxingScanner: ZXingScannerComponent
  public availableDevices: MediaDeviceInfo[]
  public selectedDevice: MediaDeviceInfo
  public scannerEnabled: boolean = true

  public isBrowser: boolean = false

  public hasCameras: boolean = false

  public hasCameraPermission: boolean | undefined = undefined

  constructor(
    private readonly schemeRouting: SchemeRoutingService,
    private readonly platform: Platform,
    private readonly scanner: ScannerService,
    private readonly permissionsService: PermissionsService
  ) {
    this.isBrowser = !this.platform.is('cordova')
  }

  public async ionViewWillEnter(): Promise<void> {
    if (this.platform.is('cordova')) {
      await this.platform.ready()
      await this.checkCameraPermissionsAndActivate()
    }
  }

  public async requestPermission(): Promise<void> {
    await this.permissionsService.userRequestsPermissions([PermissionTypes.CAMERA])
    await this.checkCameraPermissionsAndActivate()
  }

  public async checkCameraPermissionsAndActivate(): Promise<void> {
    const permission: PermissionStatus = await this.permissionsService.hasCameraPermission()
    if (permission === PermissionStatus.GRANTED) {
      this.hasCameraPermission = true
      this.startScan()
    } else {
      this.hasCameraPermission = false
    }
  }

  public ionViewDidEnter(): void {
    if (!this.platform.is('cordova')) {
      this.hasCameraPermission = true
      this.zxingScanner.camerasNotFound.pipe(first()).subscribe((_devices: MediaDeviceInfo[]) => {
        console.error('An error has occurred when trying to enumerate your video-stream-enabled devices.')
      })
      if (this.selectedDevice) {
        // Not the first time that we open scanner
        this.zxingScanner.startScan(this.selectedDevice)
      }
      this.zxingScanner.camerasFound.pipe(first()).subscribe((devices: MediaDeviceInfo[]) => {
        this.hasCameras = true
        this.availableDevices = devices
        this.selectedDevice = devices[0]
      })
    }
  }

  public ionViewWillLeave(): void {
    if (this.platform.is('cordova')) {
      this.scanner.destroy()
    } else {
      ;(this.zxingScanner as any).resetCodeReader()
    }
  }

  public startScan(): void {
    if (this.platform.is('cordova')) {
      this.scanner.show()
      this.scanner.scan(
        (text: string) => {
          this.checkScan(text).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
        },
        (error: string) => {
          console.warn(error)
          this.startScan()
        }
      )
    } else {
      // We don't need to do anything in the browser because it keeps scanning
    }
  }

  public async checkScan(data: string): Promise<boolean | void> {
    return this.schemeRouting.handleNewSyncRequest(data, () => {
      this.startScan()
    })
  }
}
