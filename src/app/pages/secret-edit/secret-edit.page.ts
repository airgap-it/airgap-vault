import { AlertService } from './../../services/alert/alert.service'
import { Component } from '@angular/core'
import { PopoverController, Platform } from '@ionic/angular'
import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionSetting } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'

export enum SecretEditAction {
  SET_RECOVERY_KEY
}

@Component({
  selector: 'airgap-secret-edit',
  templateUrl: './secret-edit.page.html',
  styleUrls: ['./secret-edit.page.scss']
})
export class SecretEditPage {
  public isGenerating: boolean = false
  public interactionSetting: boolean = false

  public isAndroid: boolean = false

  public secret: Secret

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly alertService: AlertService,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform
  ) {
    if (this.navigationService.getState()) {
      this.isGenerating = this.navigationService.getState().isGenerating
      this.secret = this.navigationService.getState().secret
      this.interactionSetting = this.secret.interactionSetting !== InteractionSetting.UNDETERMINED

      this.isAndroid = this.platform.is('android')

      this.perform(this.navigationService.getState().action)
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
      this.navigationService.route('/account-add').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  public async dismiss(): Promise<boolean> {
    try {
      return this.navigationService.routeToAccountsTab()
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

  public async resetRecoveryPassword(): Promise<void> {
    try {
      const recoveryKey = await this.secretsService.resetRecoveryPassword(this.secret)
      this.alertService.showRecoveryKeyAlert(recoveryKey)
    } catch (e) {
      this.alertService.showToast('secret-edit.secret-recovery-key.reset-error')
    }
  }

  public async presentEditPopover(event: Event): Promise<void> {
    const popover: HTMLIonPopoverElement = await this.popoverCtrl.create({
      component: SecretEditPopoverComponent,
      componentProps: {
        secret: this.secret,
        onDelete: (): void => {
          this.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        }
      },
      event,
      translucent: true
    })

    popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  private perform(action: SecretEditAction | undefined): void {
    switch (action) {
      case SecretEditAction.SET_RECOVERY_KEY:
        this.resetRecoveryPassword()
        break
    }
  }
}
