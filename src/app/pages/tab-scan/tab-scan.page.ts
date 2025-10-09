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
import { Result } from '@zxing/library'
// import { u8aToHex } from '@polkadot/util'

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

  private rawData: Uint8Array = undefined

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

  public scanComplete(ref: Result) {
    if (ref) {
      this.rawData = ref.getRawBytes()
    }
  }

  public async checkScan(data: string): Promise<boolean | void> {
    await new Promise((resolve) => setTimeout(resolve, 0))

    const sizeBefore: number = this.parts.size
    this.parts.add(data)

    if (sizeBefore === this.parts.size) {
      // We scanned a string we already have in our cache, ignoring it and starting scan again.
      this.startScan()

      return undefined
    }

    const storedData = data

    if (/[^\x20-\x7E]/.test(data) && this.rawData) {
      const hexString = [...this.rawData].map((b) => b.toString(16).padStart(2, '0')).join('')

      const targetIndex = hexString.indexOf('53')

      const cutStartIndex = Math.max(0, targetIndex - 10)

      if (targetIndex !== -1) {
        const result = hexString.substring(cutStartIndex)
        data = result
      } else {
        data = storedData
        console.log("'53' not found in the string")
      }

      console.log('data', data)
    }

    this.ngZone.run(() => {
      this.iacService
        .handleRequest(data, IACMessageTransport.QR_SCANNER, (progress: number) => {
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
