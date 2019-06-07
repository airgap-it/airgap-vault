import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { PopoverController } from '@ionic/angular'
import { NavigationService } from '../../services/navigation/navigation.service'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionSetting } from '../../services/interaction/interaction.service'
import { SecretsService } from '../../services/secrets/secrets.service'
// import { InteractionSelectionSettingsPage } from '../interaction-selection-settings/interaction-selection-settings'
// import { SocialRecoverySetupPage } from '../social-recovery-setup/social-recovery-setup'
// import { WalletSelectCoinsPage } from '../wallet-select-coins/wallet-select-coins'

// import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'

@Component({
  selector: 'airgap-secret-edit',
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
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService
  ) {
    if (this.navigationService.getState()) {
      this.isGenerating = this.navigationService.getState().isGenerating
      this.secret = this.navigationService.getState().secret
      this.interactionSetting = this.secret.interactionSetting !== InteractionSetting.UNDETERMINED
    }
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

  public goToSocialRecoverySetup(): void {
    this.navigationService
      .routeWithState('/social-recovery-setup', { secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToWalletInteraction(): void {
    this.navigationService
      .routeWithState('/interaction-selection-settings', { secret: this.secret, isEdit: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async presentEditPopover(event: Event): Promise<void> {
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
