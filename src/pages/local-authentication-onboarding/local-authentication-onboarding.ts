import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

@IonicPage()
@Component({
  selector: 'page-local-authentication-onboarding',
  templateUrl: 'local-authentication-onboarding.html'
})
export class LocalAuthenticationOnboardingPage {
  private protocolIdentifier: string
  private isHDWallet: boolean
  private customDerivationPath: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private secretsProvider: SecretsProvider
  ) {
    this.protocolIdentifier = this.navParams.get('protocolIdentifier')
    this.isHDWallet = this.navParams.get('isHDWallet')
    this.customDerivationPath = this.navParams.get('customDerivationPath')
  }

  async authenticate() {
    await this.storage.set('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING', true)
    try {
      await this.secretsProvider.addWallet(this.protocolIdentifier, this.isHDWallet, this.customDerivationPath)
    } catch (e) {
      return await this.navCtrl.pop()
    }
    await this.navCtrl.popToRoot()
  }
}
