import { Component, ViewChild } from '@angular/core'
import { BIP85 } from 'bip85'
import { VerifyKeyComponent } from 'src/app/components/verify-key/verify-key.component'
import { Secret } from 'src/app/models/secret'
import { DeviceService } from 'src/app/services/device/device.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorage, SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'

@Component({
  selector: 'airgap-bip85-validate',
  templateUrl: './bip85-validate.page.html',
  styleUrls: ['./bip85-validate.page.scss']
})
export class Bip85ValidatePage {
  @ViewChild('verify', { static: true })
  public verify: VerifyKeyComponent

  public readonly secret: Secret
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

  public onContinue(): void {
    this.goToSecretEditPage()
  }

  public goToSecretEditPage(): void {
    this.navigationService
      .routeWithState('secret-edit', { secret: this.secret, isGenerating: false })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private async generateChildMnemonic(secret: Secret, length: 12 | 18 | 24, index: number) {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    try {
      const secretHex = await secureStorage.getItem(secret.id).then((result) => result.value)

      console.log('secretHex', secretHex, length, index)

      const masterSeed = BIP85.fromEntropy(secretHex, this.bip39Passphrase)

      const childEntropy = masterSeed.deriveBIP39(0, length, index)

      this.childMnemonic = childEntropy.toMnemonic()
    } catch (error) {
      throw error
    }
  }
}
