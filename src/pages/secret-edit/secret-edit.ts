import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular'
import { Secret } from '../../models/secret'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SocialRecoverySetupPage } from '../social-recovery-setup/social-recovery-setup'
import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'
import { WalletSelectCoinsPage } from '../wallet-select-coins/wallet-select-coins'
import createHmac from 'create-hmac'

@IonicPage()
@Component({
  selector: 'page-secret-edit',
  templateUrl: 'secret-edit.html'
})
export class SecretEditPage {
  isGenerating: boolean = false
  private secret: Secret

  constructor(
    public navController: NavController,
    public popoverCtrl: PopoverController,
    public navParams: NavParams,
    private secretsProvider: SecretsProvider
  ) {
    this.secret = this.navParams.get('secret')
    this.isGenerating = this.navParams.get('isGenerating')
  }

  confirm() {
    this.secretsProvider.addOrUpdateSecret(this.secret).then(async () => {
      await this.dismiss()
      if (this.isGenerating) {
        this.navController.push(WalletSelectCoinsPage)
      }
    })
  }

  dismiss() {
    return this.navController.popToRoot()
  }

  generateOneTimePassword() {
    this.secretsProvider.retrieveEntropyForSecret(this.secret).then(entropy => {
      // taken from http://blog.tinisles.com/2011/10/google-authenticator-one-time-password-algorithm-in-javascript/
      const key = entropy
      const epoch = Math.round(new Date().getTime() / 1000.0)
      const time = Secret.leftpad(Secret.dec2hex(Math.floor(epoch / 30)), 16, '0')
      const hmacDigester = createHmac('sha1',Buffer.from(key,'hex'))
      hmacDigester.update(time,'hex') //optional encoding parameter
      const hmac = Secret.toHexString(hmacDigester.digest())
      const offset = Secret.hex2dec(hmac.substring(hmac.length - 1))
      let otp = (Secret.hex2dec(hmac.substr(offset * 2, 8)) & Secret.hex2dec('7fffffff')) + ''
      otp = (otp).substr(otp.length - 6, 6)
      alert(otp) // TODO this needs a "copy" button + a timer to show for how much longer it's valid (and regenerate if invalid) see timer in http://blog.tinisles.com/2011/10/google-authenticator-one-time-password-algorithm-in-javascript/
    })
  }

  goToSocialRecoverySetup() {
    this.navController.push(SocialRecoverySetupPage, { secret: this.secret })
  }

  presentEditPopover(event) {
    let popover = this.popoverCtrl.create(SecretEditPopoverComponent, {
      secret: this.secret,
      onDelete: () => {
        this.dismiss()
      }
    })
    popover.present({
      ev: event
    })
  }
}
