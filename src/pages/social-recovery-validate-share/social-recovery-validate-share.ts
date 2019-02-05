import { Component, ViewChild } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { VerifyKeyComponent } from '../../components/verify-key/verify-key'
import { SocialRecoveryShowSharePage } from '../social-recovery-show-share/social-recovery-show-share'
import { Secret } from '../../models/secret'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-social-recovery-validate-share',
  templateUrl: 'social-recovery-validate-share.html'
})
export class SocialRecoveryValidateSharePage {
  @ViewChild('verify')
  verify: VerifyKeyComponent

  validated = false
  shares: string[]
  currentShare: number
  secret: Secret

  constructor(public navCtrl: NavController, public navParams: NavParams, private secretsProvider: SecretsProvider) {
    this.secret = navParams.get('secret')
    this.shares = navParams.get('shares')
    this.currentShare = navParams.get('currentShare')
  }

  onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  onContinue() {
    this.next.bind(this)()
  }

  back() {
    this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  next() {
    if (this.shares.length === this.currentShare + 1) {
      this.secret.hasSocialRecovery = true
      this.secretsProvider
        .addOrUpdateSecret(this.secret)
        .then(() => {
          this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    } else {
      this.navCtrl
        .push(SocialRecoveryShowSharePage, {
          shares: this.shares,
          currentShare: this.currentShare + 1,
          secret: this.secret
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
