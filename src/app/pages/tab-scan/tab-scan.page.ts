import { IACHanderStatus, IACMessageTransport, PermissionsService, QrScannerService } from '@airgap/angular-core'
import { Component, NgZone, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { IACService } from 'src/app/services/iac/iac.service'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { ScanBasePage } from '../scan-base/scan-base'

@Component({
  selector: 'airgap-tab-scan',
  templateUrl: './tab-scan.page.html',
  styleUrls: ['./tab-scan.page.scss']
})
export class TabScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

  public percentageScanned: number = 0
  public numberOfQrsScanned: number = 0
  public numberOfQrsTotal: number = 0

  private parts: Set<string> = new Set()

  public isMultiQr: boolean = false

  constructor(
    protected platform: Platform,
    protected scanner: QrScannerService,
    protected permissionsProvider: PermissionsService,
    private readonly iacService: IACService,
    private readonly ngZone: NgZone
  ) {
    super(platform, scanner, permissionsProvider)
  }

  public async ionViewWillEnter(): Promise<void> {
    await super.ionViewWillEnter()
    this.resetScannerPage()
  }

  private resetScannerPage(): void {
    this.parts = new Set()
    this.percentageScanned = 0
    this.isMultiQr = false
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
        .handleRequest(
          Array.from(this.parts),
          IACMessageTransport.QR_SCANNER,
          (scanResult?: Error | { currentPage: number; totalPageNumber: number }) => {
            console.log('scan result', scanResult)

            const typedScanResult = (scanResult as any) as { availablePages: number[]; totalPages: number }
            if (scanResult && typedScanResult.availablePages) {
              this.isMultiQr = true
              this.numberOfQrsScanned = typedScanResult.availablePages.length
              this.numberOfQrsTotal = typedScanResult.totalPages
              this.percentageScanned = Math.max(0, Math.min(1, typedScanResult.availablePages.length / typedScanResult.totalPages))
            }
            this.startScan()
          }
        )
        .then((result: IACHanderStatus) => {
          if (result === IACHanderStatus.SUCCESS) {
            this.resetScannerPage()
          }
        })
        .catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
    })
  }
}
