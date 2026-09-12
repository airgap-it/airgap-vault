import { Component, ElementRef, ViewChild } from '@angular/core'
import { AlertController } from '@ionic/angular'

import { BIPSigner } from '../../models/BIP39Signer'
import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

import { MnemonicInputPage } from '../mnemonic-input.page'

@Component({
  selector: 'airgap-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage extends MnemonicInputPage {
  @ViewChild('secretContainer', { read: ElementRef })
  public readonly secretContainer: ElementRef<HTMLElement>

  @ViewChild('seedphraseInput')
  public readonly seedphraseInput: ElementRef<HTMLTextAreaElement>

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    alertController: AlertController
  ) {
    super(24, alertController)
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-import' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  protected isFlowValid(words: string[]): boolean {
    return BIPSigner.validateMnemonic(words.join(' '))
  }

  public goToSecretSetupPage(): void {
    const signer: BIPSigner = new BIPSigner()
    const secret: MnemonicSecret = new MnemonicSecret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.secretWords.join(' '))))
    this.navigationService.routeWithState('secret-add', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

}
