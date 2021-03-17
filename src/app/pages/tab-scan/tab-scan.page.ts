import { IACHanderStatus, IACMessageTransport, PermissionsService, QrScannerService } from '@airgap/angular-core'
import { Component, Inject, NgZone, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { URDecoder } from '@ngraveio/bc-ur'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { IACService } from 'src/app/services/iac/iac.service'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { ScanBasePage } from '../scan-base/scan-base'

var downloadBlob, downloadURL

downloadBlob = function (data: Uint8Array, fileName, mimeType) {
  var blob, url
  blob = new Blob([data], {
    type: mimeType
  })
  url = window.URL.createObjectURL(blob)
  downloadURL(url, fileName)
  setTimeout(function () {
    return window.URL.revokeObjectURL(url)
  }, 1000)
}

downloadURL = function (data, fileName) {
  var a
  a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style = 'display: none'
  a.click()
  a.remove()
}

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

  public urDecoder = new URDecoder()

  private isHandled: boolean = false

  constructor(
    platform: Platform,
    scanner: QrScannerService,
    permissionsProvider: PermissionsService,
    @Inject(SECURITY_UTILS_PLUGIN) securityUtils: SecurityUtilsPlugin,
    private readonly iacService: IACService,
    private readonly ngZone: NgZone
  ) {
    super(platform, scanner, permissionsProvider, securityUtils)
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

  public async handleUr(data: string) {
    if (this.isHandled) {
      return
    }

    const sizeBefore: number = this.parts.size
    this.parts.add(data)

    if (sizeBefore === this.parts.size) {
      return
    }

    console.log(data)

    this.urDecoder.receivePart(data)
    this.percentageScanned = this.urDecoder.estimatedPercentComplete()
    if (this.urDecoder.isComplete() && this.urDecoder.isSuccess()) {
      this.isHandled = true
      const res = this.urDecoder.resultUR().decodeCBOR()
      console.log('success', res)
      downloadBlob(new Uint8Array(Object.values(res)), 'air-gapped-file.jpg', 'application/octet-stream')
    } else {
      this.isMultiQr = true
      this.numberOfQrsScanned = this.urDecoder.getProgress() * this.urDecoder.expectedPartCount()
      this.numberOfQrsTotal = this.urDecoder.expectedPartCount()
    }
  }

  public async checkScan(data: string): Promise<boolean | void> {
    if (data.startsWith('ur:')) {
      return this.handleUr(data)
    }

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
