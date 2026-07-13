import { Component, Inject, ViewChild } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SeedQRDecoder } from 'src/app/utils/seedqr-decoder'

import { ScanBasePage } from '../scan-base/scan-base'
import { QrScannerService, PermissionsService } from '@airgap/angular-core'
import { Platform } from '@ionic/angular'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'

import { ZXingScannerComponent } from '@zxing/ngx-scanner'

@Component({
  selector: 'airgap-compactseedqr-scan',
  templateUrl: './compactseedqr-scan.component.html',
  styleUrls: ['./compactseedqr-scan.page.scss']
})
export class CompactSeedQRScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

  constructor(
  platform: Platform,
  scanner: QrScannerService,
  permissionsProvider: PermissionsService,
  @Inject(SECURITY_UTILS_PLUGIN) securityUtils: SecurityUtilsPlugin,
  private readonly navigationService: NavigationService 
) {
  super(platform, scanner, permissionsProvider, securityUtils)
}

 public async ionViewWillEnter(): Promise<void> {
  await super.ionViewWillEnter()
}

  public async checkScan(data: string): Promise<void> {
  console.log('COMPACT SCANNER:', data)
  const words = SeedQRDecoder.decode(data)

  if (!words) {
  console.log('QR não reconhecido como SeedQR')
  this.stopScan()
  this.startScan()
  return
}

  this.stopScan()

  await this.navigationService.routeWithState('/secret-import', {
    words
  })
}

  public ionViewWillLeave(): void {
  super.ionViewWillLeave()
}
}
