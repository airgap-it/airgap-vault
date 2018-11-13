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

  onCompleted(isCorrect: boolean) {
    if (isCorrect) {
      this.validated = true
    } else {
      let toast = this.toastController.create({
        message: 'Your secret is not correct',
        showCloseButton: true,
        closeButtonText: 'Try again'
      })
      // toast.onDidDismiss(() => this.verify.reset()) TODO: Sure we want to reset everything? rather fix the bug where one is missing that we can place it accordingly (first gets filled)
      toast.present()
    }
  }

  goToSecretEditPage() {
    this.navController.push(SecretEditPage, { secret: this.secret, isGenerating: true })
  }
}
