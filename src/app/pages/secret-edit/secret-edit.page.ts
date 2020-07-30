import { Component } from '@angular/core'
import { PopoverController, Platform, ToastController, AlertController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionSetting } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'
import { TranslateService } from '@ngx-translate/core'
import { ClipboardService } from 'src/app/services/clipboard/clipboard.service'

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
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform
  ) {
    //TODO: refactor with Guards
    console.log('secret edit page')
    if (this.validateState() && this.navigationService.getState()) {
      this.isGenerating = this.navigationService.getState().isGenerating
      this.secret = this.navigationService.getState().secret
      console.log('this secret: ', this.secret)
      this.interactionSetting = this.secret.interactionSetting !== InteractionSetting.UNDETERMINED

      this.isAndroid = this.platform.is('android')

      this.perform(this.navigationService.getState().action)
    } else {
      this.navigationService.routeBack('/')
      throw new Error('asdf')
    }
  }

  private validateState(): boolean {
    const actualState = this.navigationService.getState()
    console.log(true === actualState.isGenerating)
    return true === actualState.isGenerating
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
      this.showRecoveryKeyAlert(recoveryKey)
    } catch (e) {
      this.showToast('secret-edit.secret-recovery-key.reset-error')
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

  private async showToast(message: string) {
    const toast: HTMLIonToastElement = await this.toastCtrl.create({
      message: this.translateService.instant(message),
      duration: 1000,
      position: 'top',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    })
    toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  private async showRecoveryKeyAlert(recoveryKey: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: this.translateService.instant('secret-edit.secret-recovery-key.alert.title'),
      subHeader: this.translateService.instant('secret-edit.secret-recovery-key.description'),
      message: recoveryKey,
      buttons: [
        {
          text: this.translateService.instant('secret-edit.secret-recovery-key.alert.copy'),
          handler: () => {
            this.clipboardService.copy(recoveryKey)
            this.showToast('secret-edit.secret-recovery-key.copied')
          }
        },
        {
          text: this.translateService.instant('secret-edit.secret-recovery-key.alert.done'),
          handler: () => {}
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
