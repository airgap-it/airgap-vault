import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { BIP39Signer } from '../../models/BIP39Signer'
import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

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
    private readonly formBuilder: FormBuilder,
    private readonly secretsService: SecretsService
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
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-create' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public goToSecretCreatePage(): void {
    const signer: BIP39Signer = new BIP39Signer()

    const secret: Secret = new Secret(signer.mnemonicToEntropy(BIP39Signer.prepareMnemonic(this.mnemonic)))

    try {
      this.secretsService.addOrUpdateSecret(secret).catch()
    } catch (error) {
      console.error('could not save it: ', error)
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error)
    }

    setTimeout(() => {
      this.navigationService
        .routeWithState(`secret-edit/${secret.id}/${true}`, { secret, isGenerating: true })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }, 100)
  }
}
