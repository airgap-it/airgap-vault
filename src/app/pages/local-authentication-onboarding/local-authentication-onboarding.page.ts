import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-local-authentication-onboarding',
  templateUrl: './local-authentication-onboarding.page.html',
  styleUrls: ['./local-authentication-onboarding.page.scss']
})
export class LocalAuthenticationOnboardingPage {
  private readonly protocolIdentifier: string
  private readonly isHDWallet: boolean
  private readonly customDerivationPath: string

  constructor(public navCtrl: NavController, private readonly storage: Storage, private readonly secretsProvider: SecretsService) {
    // this.protocolIdentifier = this.navParams.get('protocolIdentifier')
    // this.isHDWallet = this.navParams.get('isHDWallet')
    // this.customDerivationPath = this.navParams.get('customDerivationPath')
  }

  public async authenticate() {
    await this.storage.set('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING', true)
    try {
      await this.secretsProvider.addWallet(this.protocolIdentifier, this.isHDWallet, this.customDerivationPath)
    } catch (e) {
      // return await this.navCtrl.pop()
    }
    // await this.navCtrl.popToRoot()
  }
}
