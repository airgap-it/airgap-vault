import { Component, ViewChild } from '@angular/core'
import { AlertController, NavController, Platform } from '@ionic/angular'
import { Transaction } from '../../models/transaction.model'
import { ScannerService } from '../../services/scanner/scanner.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { PermissionsService, PermissionTypes, PermissionStatus } from '../../services/permissions/permissions.service'
import { handleErrorLocal, ErrorCategory } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'app-tab-scan',
  templateUrl: './tab-scan.page.html',
  styleUrls: ['./tab-scan.page.scss']
})
export class TabScanPage {
  @ViewChild('scanner')
  zxingScanner: ZXingScannerComponent
  availableDevices: MediaDeviceInfo[]
  selectedDevice: MediaDeviceInfo
  scannerEnabled = true

  public isBrowser = false

  hasCameras = false

  public hasCameraPermission = false

  constructor(
    private schemeRouting: SchemeRoutingService,
    private alertCtrl: AlertController,
    private navController: NavController,
    private platform: Platform,
    private secretsProvider: SecretsService,
    private scanner: ScannerService,
    private permissionsProvider: PermissionsService
  ) {
    this.isBrowser = !this.platform.is('cordova')
  }

  async ionViewWillEnter() {
    if (this.platform.is('cordova')) {
      await this.platform.ready()
      await this.checkCameraPermissionsAndActivate()
    }
  }

  async requestPermission() {
    await this.permissionsProvider.userRequestsPermissions([PermissionTypes.CAMERA])
    await this.checkCameraPermissionsAndActivate()
  }

  async checkCameraPermissionsAndActivate() {
    const permission = await this.permissionsProvider.hasCameraPermission()
    if (permission === PermissionStatus.GRANTED) {
      this.hasCameraPermission = true
      this.startScan()
    }
  }

  ionViewDidEnter() {
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

  ionViewWillLeave() {
    if (this.platform.is('cordova')) {
      this.scanner.destroy()
    } else {
      ;(this.zxingScanner as any).resetCodeReader()
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

  async checkScan(data: string) {
    return this.schemeRouting.handleNewSyncRequest(this.navController, data, () => {
      this.startScan()
    })
  }
}
