import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'
import * as bip39 from 'bip39'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

import { Secret } from '../../models/secret'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-social-recovery-setup',
  templateUrl: './social-recovery-setup.page.html',
  styleUrls: ['./social-recovery-setup.page.scss']
})
export class SocialRecoverySetupPage {
  private numberOfShares = 3
  private numberOfRequiredShares = 2
  private readonly secret: Secret

  constructor(
    public navCtrl: NavController,
    private readonly secretService: SecretsService,
    private readonly navigationService: NavigationService
  ) {
    this.secret = this.navigationService.getState().secret
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

  public next(): void {
    this.secretService
      .retrieveEntropyForSecret(this.secret)
      .then(entropy => {
        const shares: string[] = Secret.generateSocialRecover(
          bip39.entropyToMnemonic(entropy),
          this.numberOfShares,
          this.numberOfRequiredShares
        )
        this.navigationService
          .routeWithState('/social-recovery-show-share', { shares, currentShare: 0, secret: this.secret })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(error => {
        console.warn(error)
      })
  }
}
