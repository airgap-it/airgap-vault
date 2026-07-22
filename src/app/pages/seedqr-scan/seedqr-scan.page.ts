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
  selector: 'airgap-seedqr-scan',
  templateUrl: './seedqr-scan.component.html',
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
  private readonly navigationService: NavigationService 
) {
  super(platform, scanner, permissionsProvider, securityUtils)
}

 public ionViewWillEnter(): Promise<void> {
  return super.ionViewWillEnter()
}

  public checkScan(data: string): void {
 
  let words: string[] | null = null

  // Primeiro tenta Standard SeedQR
  try {
    words = SeedQRDecoder.decode(data)
  } catch {
    // Ignora erro e tenta CompactSeedQR abaixo
  }

  if (words) {
   
    this.stopScan()

    this.navigationService.routeWithState('/secret-import', {
  words
}).catch(() => {})

    return
  }

  // Depois tenta CompactSeedQR
  try {
    words = SeedQRDecoder.decodeCompact(data)
  } catch {
    
  }

  if (words) {
    
    this.stopScan()

    this.navigationService.routeWithState('/secret-import', {
  words
}).catch(() => {})

    return
  }
  
  this.stopScan()
  this.startScan()
 }

  public ionViewWillLeave(): void {
  super.ionViewWillLeave()
}
}