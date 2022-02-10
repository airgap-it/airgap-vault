import { Component } from '@angular/core'
import { BIPSigner } from 'src/app/models/BIP39Signer'
import { BIP85 } from 'src/app/models/BIP85'
import { MnemonicSecret } from 'src/app/models/secret'
import { DeviceService } from 'src/app/services/device/device.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorage, SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'

@Component({
  selector: 'airgap-bip85-show',
  templateUrl: './bip85-show.page.html',
  styleUrls: ['./bip85-show.page.scss']
})
export class Bip85ShowPage {
  private secret: MnemonicSecret
  public mnemonicLength: 12 | 18 | 24
  public index: number

  public childMnemonic: string | undefined

  public bip39Passphrase: string = ''

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly secureStorageService: SecureStorageService
  ) {
    if (this.navigationService.getState()) {
      this.secret = this.navigationService.getState().secret
      this.mnemonicLength = this.navigationService.getState().mnemonicLength
      this.index = this.navigationService.getState().index
      this.bip39Passphrase = this.navigationService.getState().bip39Passphrase

      this.generateChildMnemonic(this.secret, this.mnemonicLength, this.index)
    }
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'tab-settings' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public goToSecretSetupPage(): void {
    const signer: BIPSigner = new BIPSigner()

    const secret: MnemonicSecret = new MnemonicSecret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.childMnemonic)))

    this.navigationService
      .routeWithState('secret-add', { secret: new MnemonicSecret(secret.secretHex, `BIP85 child of "${this.secret.label}"`) })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private async generateChildMnemonic(secret: MnemonicSecret, length: 12 | 18 | 24, index: number) {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    try {
      const secretHex = await secureStorage.getItem(secret.id).then((result) => result.value)

      const masterSeed = BIP85.fromEntropy(secretHex, this.bip39Passphrase)

      const childEntropy = masterSeed.deriveBIP39(0, length, index)

      this.childMnemonic = childEntropy.toMnemonic()
    } catch (error) {
      throw error
    }
  }
}
