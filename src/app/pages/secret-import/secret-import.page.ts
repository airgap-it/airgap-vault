import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { BIPSigner } from '../../models/BIP39Signer'
import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

@Component({
  selector: 'airgap-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage {
  public mnemonic: string
  public secretImportForm: FormGroup

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly formBuilder: FormBuilder
  ) {
    const formGroup: {
      [key: string]: any
    } = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    this.secretImportForm = this.formBuilder.group(formGroup)
    this.secretImportForm.valueChanges.subscribe((formGroup) => {
      this.mnemonic = formGroup.mnemonic
    })
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-setup' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public goToSecretSetupPage(): void {
    const signer: BIPSigner = new BIPSigner()

    const secret: MnemonicSecret = new MnemonicSecret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.mnemonic)))

    this.navigationService.routeWithState('secret-add', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
