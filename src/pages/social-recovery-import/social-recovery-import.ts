import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Secret } from '../../models/secret'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

/**
 * Generated class for the SocialRecoverySetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-social-recovery-import',
  templateUrl: 'social-recovery-import.html'
})
export class SocialRecoveryImportPage {

  private numberOfShares: number
  private shares: string[]

  socialRecoveryForm: FormGroup

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder) {

  }

  setNumberOfShares(i: number) {
    this.numberOfShares = i
    this.shares = Array(i)

    let formGroup = {}

    this.getNumberArray(i).forEach(i => {
      formGroup['share_' + i] = ['', Validators.compose([Validators.required, MnemonicValidator.isValidShare])]
      if (this.socialRecoveryForm && this.socialRecoveryForm.value['share_' + i]) {
        formGroup['share_' + i][0] = this.socialRecoveryForm.value['share_' + i]
      }
    })

    this.socialRecoveryForm = this.formBuilder.group(formGroup)
  }

  recover() {
    try {
      const secret = Secret.recoverSecretFromShares(this.shares)
      this.navCtrl.push(SecretEditPage, { secret: new Secret(secret, 'Recovery by Social Recovery') })
    } catch (error) {
      console.log('oops')
    }
  }

  back() {
    this.navCtrl.pop()
  }

  getNumberArray(i: number): number[] {
    return Array(i).fill(0).map((x, i) => i)
  }

}
