import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular'
import { Secret } from '../../models/secret'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SocialRecoverySetupPage } from '../social-recovery-setup/social-recovery-setup'
import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'
import { WalletSelectCoinsPage } from '../wallet-select-coins/wallet-select-coins'

/**
 * Generated class for the SecretEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-secret-edit',
  templateUrl: 'secret-edit.html'
})

export class SecretEditPage {

  isGenerating: boolean = false
  private secret: Secret

  constructor(public navController: NavController, public popoverCtrl: PopoverController, public navParams: NavParams, private secretsProvider: SecretsProvider) {
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
