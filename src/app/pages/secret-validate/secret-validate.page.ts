import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { NavController } from '@ionic/angular'

import { Secret } from '../../models/secret'

import { VerifyKeyComponent } from './../../components/verify-key/verify-key.component'
// import { SecretEditPage } from '../secret-edit/secret-edit'

@Component({
  selector: 'secret-validate',
  templateUrl: './secret-validate.page.html',
  styleUrls: ['./secret-validate.page.scss']
})
export class SecretValidatePage {
  @ViewChild('verify')
  public verify: VerifyKeyComponent

  public readonly secret: Secret

  private validated: boolean = false

  constructor(private readonly navController: NavController, private readonly router: Router) {
    // this.secret = this.navParams.get('secret')
    this.secret = new Secret('90ac75896c3f57107c4ab0979b7c2ca1790e29ce7d25308b997fbbd53b9829c4', 'asdf') // TODO: Get secret from previous page
  }

  public onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  public onContinue() {
    this.goToSecretEditPage()
  }

  public goToSecretEditPage() {
    // this.router.navigate(['secret-edit']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    // this.navController
    //   .push(SecretEditPage, { secret: this.secret, isGenerating: true })
    //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
