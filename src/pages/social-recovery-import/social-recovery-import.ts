import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Secret } from '../../models/secret'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MnemonicValidator } from '../../validators/mnemonic.validator'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-social-recovery-import',
  templateUrl: 'social-recovery-import.html'
})
export class SocialRecoveryImportPage {
  public numberOfShares: number
  public shares: string[]

  socialRecoveryForm: FormGroup

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder) { }

  setNumberOfShares(i: number) {
    this.numberOfShares = i
    this.shares = Array(i)

    let formGroup = {}

    this.getNumberArray(i).forEach(i => {
      formGroup['share_' + i.toString()] = ['', Validators.compose([Validators.required, MnemonicValidator.isValidShare])]
      if (this.socialRecoveryForm && this.socialRecoveryForm.value['share_' + i.toString()]) {
        formGroup['share_' + i.toString()][0] = this.socialRecoveryForm.value['share_' + i.toString()]
      }
    })

    this.socialRecoveryForm = this.formBuilder.group(formGroup)
  }

  recover() {
    try {
      const secret = Secret.recoverSecretFromShares(this.shares)
      this.navCtrl
        .push(SecretEditPage, { secret: new Secret(secret, 'Recovery by Social Recovery') })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (error) {
      console.log('oops')
    }
  }

  back() {
    this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  getNumberArray(i: number): number[] {
    return Array(i)
      .fill(0)
      .map((_x, i) => i)
  }
}
