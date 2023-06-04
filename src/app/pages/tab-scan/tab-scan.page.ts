import { IACHandlerStatus, IACMessageTransport, PermissionsService, QrScannerService } from '@airgap/angular-core'
import { PercentPipe } from '@angular/common'
import { Component, Inject, NgZone, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { IACService } from 'src/app/services/iac/iac.service'
// import { NavigationService } from 'src/app/services/navigation/navigation.service'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { ScanBasePage } from '../scan-base/scan-base'

@Component({
  selector: 'airgap-tab-scan',
  templateUrl: './tab-scan.page.html',
  styleUrls: ['./tab-scan.page.scss'],
  providers: [PercentPipe]
})
export class TabScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

  public percentageScanned: number = 0

  private parts: Set<string> = new Set()

  public isMultiQr: boolean = false

  constructor(
    platform: Platform,
    scanner: QrScannerService,
    permissionsProvider: PermissionsService,
    @Inject(SECURITY_UTILS_PLUGIN) securityUtils: SecurityUtilsPlugin,
    private readonly iacService: IACService,
    private readonly ngZone: NgZone // private readonly navigationService: NavigationService
  ) {
    super(platform, scanner, permissionsProvider, securityUtils)
  }

  public async ionViewWillEnter(): Promise<void> {
    await super.ionViewWillEnter()
    this.resetScannerPage()
    this.iacService.resetHandlers()
  }

  private resetScannerPage(): void {
    this.parts = new Set()
    this.percentageScanned = 0
    this.isMultiQr = false
    this.iacService.resetHandlers()
  }

  public async checkScan(data: string): Promise<boolean | void> {
    const sizeBefore: number = this.parts.size
    this.parts.add(data)

    if (sizeBefore === this.parts.size) {
      // We scanned a string we already have in our cache, ignoring it and starting scan again.
      console.log(`[SCAN:checkScan]: Already scanned string skipping ${data}`)
      this.startScan()

      return undefined
    }

    console.log(`[SCAN:checkScan]: Trying to decode string ${data}`)

    this.ngZone.run(() => {
      this.iacService
        .handleRequest(data, IACMessageTransport.QR_SCANNER, (progress: number) => {
          console.log('scan result', progress)
          this.isMultiQr = true
          this.percentageScanned = progress ?? 0
          this.startScan()
        })
        .then((result: IACHandlerStatus) => {
          if (result === IACHandlerStatus.SUCCESS) {
            // this.navigationService
            //   .route('/')
            //   .then(() => {
            this.resetScannerPage()
            this.stopScan()
            // })
            // .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          }
        })
        .catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
    })
  }
}
