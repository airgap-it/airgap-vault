import { Component, Inject, ViewChild } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SeedQRDecoder } from 'src/app/utils/seedqr-decoder'

import { ScanBasePage } from '../scan-base/scan-base'
import { QrScannerService, PermissionsService } from '@airgap/angular-core'
import { Platform } from '@ionic/angular'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'

import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { BIPSigner } from '../../models/BIP39Signer'

@Component({
  selector: 'airgap-seedqr-scan',
  templateUrl: './seedqr-scan.component.html',
  styleUrls: ['./seedqr-scan.page.scss']
})
export class SeedQRScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

  private readonly bipSigner = new BIPSigner()

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

  console.log('DADOS RECEBIDOS:', data)

  // Primeiro tenta Standard SeedQR

let words: string[] | null = null

try {
  words = SeedQRDecoder.decode(data)
} catch (e) {
  console.log('STANDARD DECODER ERRO:', e)
}

if (words) {
  console.log('STANDARD OK')

  this.stopScan()

  await this.navigationService.routeWithState('/secret-import', {
    words
  })

  return
}


// Depois tenta CompactSeedQR

try {
  words = SeedQRDecoder.decodeCompact(data)
} catch (e) {
  console.log('COMPACT DECODER ERRO:', e)
}

if (words) {
  console.log('COMPACT OK')

  this.stopScan()

  await this.navigationService.routeWithState('/secret-import', {
    words
  })

  return
}


console.log('QR não reconhecido')
this.stopScan()
this.startScan()

  // Se falhou, tenta CompactSeedQR
  console.log('Tentando CompactSeedQR')

  const bytes = new Uint8Array(
    [...data].map((char) => char.charCodeAt(0))
  )

  console.log('BYTES:', bytes)

  const hex = Buffer.from(bytes).toString('hex')

  console.log('HEX:', hex)

  try {
    const mnemonic = this.bipSigner.entropyToMnemonic(hex)
    const compactWords = mnemonic.split(' ')

    console.log('COMPACT OK:', compactWords)

    this.stopScan()

    await this.navigationService.routeWithState('/secret-import', {
      words: compactWords
    })

  } catch (e) {
    console.log('CompactSeedQR inválido')
    this.stopScan()
    this.startScan()
  }
}

  public ionViewWillLeave(): void {
  super.ionViewWillLeave()
}
}
