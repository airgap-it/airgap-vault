import { Component, ViewChild } from '@angular/core'
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular'
import { VerifyKeyComponent } from '../../components/verify-key/verify-key'
import { Secret } from '../../models/secret'
import { SecretEditPage } from '../secret-edit/secret-edit'

@IonicPage()
@Component({
  selector: 'page-secret-validate',
  templateUrl: 'secret-validate.html'
})
export class SecretValidatePage {
  @ViewChild('verify')
  verify: VerifyKeyComponent

  private secret: Secret
  private validated = false

  constructor(private navController: NavController, private toastController: ToastController, private navParams: NavParams) {
    this.secret = this.navParams.get('secret')
  }

  onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  onContinue() {
    this.goToSecretEditPage()
  }

  goToSecretEditPage() {
    this.navController.push(SecretEditPage, { secret: this.secret, isGenerating: true })
  }
}
