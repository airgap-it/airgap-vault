import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Secret } from '../../models/secret'
import { SocialRecoveryShowSharePage } from '../social-recovery-show-share/social-recovery-show-share'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import * as bip39 from 'bip39'

@IonicPage()
@Component({
  selector: 'page-social-recovery-setup',
  templateUrl: 'social-recovery-setup.html'
})
export class SocialRecoverySetupPage {
  private numberOfShares = 3
  private numberOfRequiredShares = 2
  private secret: Secret

  constructor(public navCtrl: NavController, public navParams: NavParams, private secretProvider: SecretsProvider) {
    this.secret = this.navParams.get('secret')
  }

  setNumberOfShares(i: number) {
    this.numberOfShares = i
    if (this.numberOfRequiredShares > this.numberOfShares) {
      this.numberOfRequiredShares = this.numberOfShares
    }
  }

  setNumberOfRequiredShares(i: number) {
    this.numberOfRequiredShares = i
  }

  back() {
    this.navCtrl.pop()
  }

  next() {
    this.secretProvider
      .retrieveEntropyForSecret(this.secret)
      .then(entropy => {
        const shares = Secret.generateSocialRecover(bip39.entropyToMnemonic(entropy), this.numberOfShares, this.numberOfRequiredShares)
        this.navCtrl.push(SocialRecoveryShowSharePage, { shares: shares, currentShare: 0, secret: this.secret })
      })
      .catch(error => {
        console.warn(error)
      })
  }
}
