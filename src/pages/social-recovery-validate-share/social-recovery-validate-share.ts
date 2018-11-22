import { Component, ViewChild } from '@angular/core'
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular'
import { VerifyKeyComponent } from '../../components/verify-key/verify-key'
import { SocialRecoveryShowSharePage } from '../social-recovery-show-share/social-recovery-show-share'
import { Secret } from '../../models/secret'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertController: AlertController,
    private secretsProvider: SecretsProvider
  ) {
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
    this.navCtrl.pop()
  }

  next() {
    if (this.shares.length === this.currentShare + 1) {
      this.secret.hasSocialRecovery = true
      this.secretsProvider.addOrUpdateSecret(this.secret).then(() => {
        this.navCtrl.popToRoot()
      })
    } else {
      this.navCtrl.push(SocialRecoveryShowSharePage, {
        shares: this.shares,
        currentShare: this.currentShare + 1,
        secret: this.secret
      })
    }
  }
}
