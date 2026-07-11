import { Component, Inject, NgZone, ViewChild } from '@angular/core'

import { ScanBasePage } from '../scan-base/scan-base'
import { QrScannerService, PermissionsService } from '@airgap/angular-core'
import { Platform } from '@ionic/angular'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { IACService } from 'src/app/services/iac/iac.service'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'

@Component({
  selector: 'airgap-seedqr-scan',
  templateUrl: './seedqr-scan.page.html',
  styleUrls: ['./seedqr-scan.page.scss']
})
export class SeedQRScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

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
    this.iacService.resetHandlers()
  }

  private resetScannerPage(): void {
    this.iacService.resetHandlers()
  }

  public async checkScan(data: string): Promise<boolean | void> {
  this.ngZone.run(() => {
    console.log('SeedQR recebido:', data)
  })
}

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
    this.resetScannerPage()
  }
}
