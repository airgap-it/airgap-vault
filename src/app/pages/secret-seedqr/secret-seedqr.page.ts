import { Component } from '@angular/core'
import { MnemonicSecret } from '../../models/secret'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SeedQrEncoder } from '../../utils/seedqr-encoder'
import { SecretsService } from '../../services/secrets/secrets.service'
import * as QRCode from 'qrcode'

@Component({
  selector: 'airgap-secret-seedqr',
  templateUrl: './secret-seedqr.page.html',
  styleUrls: ['./secret-seedqr.page.scss']
})
export class SecretSeedqrPage {

  public readonly secret: MnemonicSecret
  public seedQrData: string = ''
  public qrImage: string = ''
  public format: 'standard' | 'compact' = 'standard'
  public fingerprint: string = ''
  public wordCount: number = 0

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService
  ) {

    const state = this.navigationService.getState()

    this.secret = state.secret
    this.format = state.format || 'standard'
  }

  
   public async ionViewDidEnter(): Promise<void> {

  const entropy = await this.secretsService.retrieveEntropyForSecret(this.secret)

  const secret = new MnemonicSecret(entropy)

  const mnemonic = secret.recoverMnemonicFromHex(secret.secretHex)
  
  this.wordCount = mnemonic.trim().split(/\s+/).length
  this.fingerprint = this.secret.fingerprint


  if (this.format === 'compact') {

    const compact = SeedQrEncoder.encodeCompactSeedQR(mnemonic)

    this.qrImage = await QRCode.toDataURL(
      [
        {
          data: compact,
          mode: 'byte'
        }
      ] as any,
      {
        errorCorrectionLevel: 'L',
        width: 300
      }
    )

  } else {

    this.seedQrData = SeedQrEncoder.encodeSeedQR(mnemonic)

  }

}
   public openTemplate(): void {
  void this.navigationService.routeWithState('/secret-seedqr-template', {
    secret: this.secret,
    format: this.format,
    wordCount: this.wordCount,
    fingerprint: this.fingerprint,
    seedQrData: this.seedQrData,
    qrImage: this.qrImage
  })
}

}