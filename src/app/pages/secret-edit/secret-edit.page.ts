import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { NavController, NavParams, PopoverController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionSetting } from '../../services/interaction/interaction.service'
import { SecretsService } from '../../services/secrets/secrets.service'
// import { InteractionSelectionSettingsPage } from '../interaction-selection-settings/interaction-selection-settings'
// import { SocialRecoverySetupPage } from '../social-recovery-setup/social-recovery-setup'
// import { WalletSelectCoinsPage } from '../wallet-select-coins/wallet-select-coins'

// import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'

@Component({
  selector: 'app-secret-edit',
  templateUrl: './secret-edit.page.html',
  styleUrls: ['./secret-edit.page.scss']
})
export class SecretEditPage {
  public isGenerating: boolean = false
  public interactionSetting: boolean = false

  public secret: Secret

  constructor(
    private readonly router: Router,
    private readonly popoverCtrl: PopoverController,
    private readonly secretsService: SecretsService
  ) {
    this.secret = new Secret('90ac75896c3f57107c4ab0979b7c2ca1790e29ce7d25308b997fbbd53b9829c4', 'asdf') // TODO: Get secret from previous page
    /*this.isGenerating = this.navParams.get('isGenerating')

		this.interactionSetting = this.secret.interactionSetting !== InteractionSetting.UNDETERMINED
		*/
  }

  public async confirm(): Promise<void> {
    try {
      await this.secretsService.addOrUpdateSecret(this.secret).catch()
    } catch (error) {
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error)

      // TODO: Show error
      return
    }

    await this.dismiss()
    if (this.isGenerating) {
      this.router.navigate(['account-add']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  public async dismiss(): Promise<boolean> {
    try {
      return this.router.navigateByUrl('/tabs/tab-accounts')
    } catch (error) {
      return false
    }
  }

  public goToSocialRecoverySetup() {
    // this.navController.push(SocialRecoverySetupPage, { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToWalletInteraction() {
    /*
    this.navController
      .push(InteractionSelectionSettingsPage, { secret: this.secret, isEdit: true })
			.catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
			*/
  }

  public presentEditPopover(event) {
    /*
    const popover = this.popoverCtrl.create(SecretEditPopoverComponent, {
      secret: this.secret,
      onDelete: () => {
        this.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      }
    })
    popover
      .present({
        ev: event
      })
			.catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
			*/
  }
}
