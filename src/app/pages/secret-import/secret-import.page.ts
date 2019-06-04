import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'

import { BIP39Signer } from '../../models/BIP39Signer'
import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'
// import { SecretEditPage } from '../secret-edit/secret-edit'

@Component({
  selector: 'app-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage {
  public readonly mnemonic: string
  public secretImportForm: FormGroup

  constructor(private readonly router: Router, private readonly formBuilder: FormBuilder) {
    const formGroup = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    this.secretImportForm = this.formBuilder.group(formGroup)
  }

  public goToSecretCreatePage(): void {
    const signer: BIP39Signer = new BIP39Signer()

    const secret: Secret = new Secret(signer.mnemonicToEntropy(BIP39Signer.prepareMnemonic(this.mnemonic)))

    this.router.navigate(['secret-edit']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    // this.navController.push(SecretEditPage, { secret, isGenerating: true }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
