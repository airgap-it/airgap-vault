import { Component } from '@angular/core'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicSecret } from '../../models/secret'
import { SeedQrEncoder } from '../../utils/seedqr-encoder'
import { SecretsService } from '../../services/secrets/secrets.service'
import * as QRCode from 'qrcode'

@Component({
  selector: 'airgap-secret-seedqr-template-view',
  templateUrl: './secret-seedqr-template-view.page.html',
  styleUrls: ['./secret-seedqr-template-view.page.scss']
})
export class SecretSeedqrTemplateViewPage {

  public readonly secret: MnemonicSecret
  public format: 'standard' | 'compact' = 'standard'
  public wordCount = 0
  public numModules = 0
  public seedQrData: string = ''
  public qrImage: string = ''
  public zones: any[] = []
  public zoneSize = 0
  public selectedZone: any = null
  public showZone = false
  public zoneRows = 0
  public zoneCols = 0
  public qrModules: boolean[][] = []
  public zoneModules: boolean[][] = []

  constructor(
  private readonly navigationService: NavigationService,
  private readonly secretsService: SecretsService
) {

  const state = this.navigationService.getState()

  this.secret = state.secret
  this.format = state.format
  this.wordCount = state.wordCount
  this.numModules = state.numModules
  this.seedQrData = state.seedQrData
  this.qrImage = state.qrImage

}

public async ionViewDidEnter(): Promise<void> {

  const entropy = await this.secretsService.retrieveEntropyForSecret(this.secret)

  const secret = new MnemonicSecret(entropy)

  const mnemonic = secret.recoverMnemonicFromHex(secret.secretHex)


  if (this.format === 'compact') {


    const compact = SeedQrEncoder.encodeCompactSeedQR(mnemonic)


    const qr = QRCode.create(
      [
        {
          data: compact,
          mode: 'byte'
        }
      ] as any,
      {
        errorCorrectionLevel: 'L'
      }
    )


    this.qrModules = []


    for (let row = 0; row < qr.modules.size; row++) {

      const line: boolean[] = []


      for (let col = 0; col < qr.modules.size; col++) {

        line.push(
          qr.modules.get(row, col) === 1
        )

      }


      this.qrModules.push(line)

    }


    this.qrImage = await QRCode.toDataURL(
      [
        {
          data: compact,
          mode: 'byte'
        }
      ] as any,
      {
        errorCorrectionLevel: 'L',
        width: 250,
        margin: 0
      }
    )


  } else {


    const standard = SeedQrEncoder.encodeSeedQR(mnemonic)


    const qr = QRCode.create(
      standard,
      {
        errorCorrectionLevel: 'L'
      }
    )


    this.qrModules = []


    for (let row = 0; row < qr.modules.size; row++) {

      const line: boolean[] = []


      for (let col = 0; col < qr.modules.size; col++) {

        line.push(
          qr.modules.get(row, col) === 1
        )

      }


      this.qrModules.push(line)

    }


    this.qrImage = await QRCode.toDataURL(
      standard,
      {
        errorCorrectionLevel: 'L',
        width: 250,
        margin: 0
      }
    )

  }


  this.createZones()

}


private createZones(): void {

  this.zones = []

  const modules = this.getModulesSize()

  this.numModules = modules

  const { blocks, blockSize } = this.getBlockConfig(modules)

  for (let row = 0; row < blocks; row++) {
    for (let col = 0; col < blocks; col++) {
      this.addZone(row, col, blocks, blockSize, modules)
    }
  }
}

private getModulesSize(): number {
  if (this.format === 'standard') {
    return this.wordCount === 12 ? 25 : 29
  }

  return this.wordCount === 12 ? 21 : 25
}

private getBlockConfig(modules: number): { blocks: number; blockSize: number } {

  if (modules === 21) {
    return { blocks: 3, blockSize: 7 }
  }

  if (modules === 25) {
    return { blocks: 5, blockSize: 5 }
  }

  return { blocks: 6, blockSize: 5 }
}

private addZone(
  row: number,
  col: number,
  blocks: number,
  blockSize: number,
  modules: number
): void {

  let rows = blockSize
  let cols = blockSize

  if (modules === 29) {

    if (row === 5 && col < 5) {
      rows = 4
      cols = 5
    }

    if (col === 5 && row < 5) {
      rows = 5
      cols = 4
    }

    if (row === 5 && col === 5) {
      rows = 4
      cols = 4
    }
  }

  const disabled =
    (row === 0 && col === 0) ||
    (row === 0 && col === blocks - 1) ||
    (row === blocks - 1 && col === 0)

  this.zones.push({
    label: `${String.fromCodePoint(65 + row)}${col + 1}`,
    row,
    col,
    rows,
    cols,
    disabled
  })
}

   public selectZone(zone: any): void {

   this.selectedZone = zone

   this.zoneRows = zone.rows
   this.zoneCols = zone.cols


   this.zoneModules = []


   let startRow = 0
   let startCol = 0


   if (this.numModules === 29) {

   startRow = zone.row === 5 ? 25 : zone.row * 5

   startCol = zone.col === 5 ? 25 : zone.col * 5

   } else {

   startRow = zone.row * zone.rows

   startCol = zone.col * zone.cols

  }


  for (let row = 0; row < zone.rows; row++) {

    const line: boolean[] = []


    for (let col = 0; col < zone.cols; col++) {

      line.push(
        this.qrModules[startRow + row][startCol + col]
      )

    }


    this.zoneModules.push(line)

  }


  this.showZone = true

}

}