import { Component } from '@angular/core'
import { BIP32Interface, fromSeed } from 'bip32'
import { mnemonicToSeed } from 'bip39'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { BIPSigner } from 'src/app/models/BIP39Signer'
import { BIP85 } from 'bip85'
import { MnemonicSecret } from 'src/app/models/secret'
import { DeviceService } from 'src/app/services/device/device.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorage, SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

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
  public childFingerprint: string | undefined
  public lifehashData: string | undefined

  public bip39Passphrase: string = ''

  public isBlurred: boolean = true
  blurText =
    '****** **** ***** **** ******* ***** ***** ****** ***** *** ***** ******* ***** **** ***** ********* ***** ****** ***** **** ***** ******* ***** ****'

  public isAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly secureStorageService: SecureStorageService,
    private readonly lifehashService: LifehashService,
    private readonly storageService: VaultStorageService
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

  public timeout: NodeJS.Timer

  changeBlur() {
    this.isBlurred = !this.isBlurred

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.isBlurred = true
    }, 30_000)
  }

  private async generateChildMnemonic(secret: MnemonicSecret, length: 12 | 18 | 24, index: number) {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    try {
      const secretHex = await secureStorage.getItem(secret.id).then((result) => result.value)

      const masterSeed = BIP85.fromEntropy(secretHex, this.bip39Passphrase)

      const childEntropy = masterSeed.deriveBIP39(0, length, index)

      this.childMnemonic = childEntropy.toMnemonic()

      const seed: Buffer = await mnemonicToSeed(this.childMnemonic)
      const bip32Node: BIP32Interface = fromSeed(seed)
      this.childFingerprint = bip32Node.fingerprint.toString('hex')

      this.lifehashData = await this.lifehashService.generateLifehash(this.childFingerprint)
    } catch (error) {
      throw error
    }
  }
}
