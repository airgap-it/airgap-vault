import { Component } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'
import * as bip39 from 'bip39'

import { Secret } from '../../models/secret'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-social-recovery-setup',
  templateUrl: './social-recovery-setup.page.html',
  styleUrls: ['./social-recovery-setup.page.scss']
})
export class SocialRecoverySetupPage {
  private numberOfShares = 3
  private numberOfRequiredShares = 2
  private readonly secret: Secret

  constructor(public navCtrl: NavController, public navParams: NavParams, private readonly secretService: SecretsService) {
    // this.secret = this.navParams.get('secret')
  }

  public setNumberOfShares(i: number) {
    this.numberOfShares = i
    if (this.numberOfRequiredShares > this.numberOfShares) {
      this.numberOfRequiredShares = this.numberOfShares
    }
  }

  public setNumberOfRequiredShares(i: number) {
    this.numberOfRequiredShares = i
  }

  public back() {
    // this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public next() {
    this.secretService
      .retrieveEntropyForSecret(this.secret)
      .then(entropy => {
        const shares = Secret.generateSocialRecover(bip39.entropyToMnemonic(entropy), this.numberOfShares, this.numberOfRequiredShares)
        // this.navCtrl
        //   .push(SocialRecoveryShowSharePage, { shares: shares, currentShare: 0, secret: this.secret })
        //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(error => {
        console.warn(error)
      })
  }
}
