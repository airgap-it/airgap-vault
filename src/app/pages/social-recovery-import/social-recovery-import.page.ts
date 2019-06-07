import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NavController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

@Component({
  selector: 'airgap-social-recovery-import',
  templateUrl: './social-recovery-import.page.html',
  styleUrls: ['./social-recovery-import.page.scss']
})
export class SocialRecoveryImportPage {
  public numberOfShares: number
  public shares: string[]

  public socialRecoveryForm: FormGroup

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder) {
    this.setNumberOfShares(2)
  }

  public setNumberOfShares(i: number) {
    this.numberOfShares = i
    this.shares = Array(i)

    const formGroup = {}

    this.getNumberArray(i).forEach(i => {
      formGroup['share_' + i.toString()] = ['', Validators.compose([Validators.required, MnemonicValidator.isValidShare])]
      if (this.socialRecoveryForm && this.socialRecoveryForm.value['share_' + i.toString()]) {
        formGroup['share_' + i.toString()][0] = this.socialRecoveryForm.value['share_' + i.toString()]
      }
    })

    this.socialRecoveryForm = this.formBuilder.group(formGroup)
  }

  public recover() {
    try {
      const secret = Secret.recoverSecretFromShares(this.shares)
      // this.navCtrl
      //   .push(SecretEditPage, { secret: new Secret(secret, 'Recovery by Social Recovery') })
      //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (error) {
      console.log('oops')
    }
  }

  public back() {
    // this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public getNumberArray(i: number): number[] {
    return Array(i)
      .fill(0)
      .map((_x, i) => i)
  }
}
