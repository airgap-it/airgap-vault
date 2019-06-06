import { Component, ViewChild } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-social-recovery-validate-share',
  templateUrl: './social-recovery-validate-share.page.html',
  styleUrls: ['./social-recovery-validate-share.page.scss']
})
export class SocialRecoveryValidateSharePage {
  @ViewChild('verify')
  public verify: VerifyKeyComponent

  public validated = false
  public shares: string[]
  public currentShare: number
  public secret: Secret

  constructor(public navCtrl: NavController, public navParams: NavParams, private readonly secretsService: SecretsService) {
    // this.secret = navParams.get('secret')
    // this.shares = navParams.get('shares')
    // this.currentShare = navParams.get('currentShare')
  }

  public onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  public onContinue() {
    this.next.bind(this)()
  }

  public back() {
    // this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public next() {
    if (this.shares.length === this.currentShare + 1) {
      this.secret.hasSocialRecovery = true
      this.secretsService
        .addOrUpdateSecret(this.secret)
        .then(() => {
          // this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    } else {
      // this.navCtrl
      //   .push(SocialRecoveryShowSharePage, {
      //     shares: this.shares,
      //     currentShare: this.currentShare + 1,
      //     secret: this.secret
      //   })
      //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
