import { Component } from '@angular/core'
import { PopoverController, Platform, ToastController, AlertController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionSetting } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'
import { TranslateService } from '@ngx-translate/core'
import { ClipboardService } from '@airgap/angular-core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'

export enum SecretEditAction {
  SET_RECOVERY_KEY
}

@Component({
  selector: 'airgap-secret-edit',
  templateUrl: './secret-edit.page.html',
  styleUrls: ['./secret-edit.page.scss']
})
export class SecretEditPage {
  public flow: string = 'edit'
  public interactionSetting: boolean = false
  public isGenerating: boolean = false

  public isAndroid: boolean = false

  public secret: Secret
  public secretID: string
  public readonly secrets$: Observable<Secret[]>

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(async (params) => {
      this.secretID = params['secretID']
      this.flow = params['flow']

      this.secret = this.secretsService.getSecretById(this.secretID)
      this.interactionSetting = this.secret.interactionSetting !== InteractionSetting.UNDETERMINED

      this.isAndroid = this.platform.is('android')

      this.perform(this.navigationService.getState().action)

      this.isGenerating = this.flow === 'generate'
    })
    this.secrets$ = this.secretsService.getSecretsObservable()
  }

  public async confirm(): Promise<void> {
    try {
      await this.secretsService.addOrUpdateSecret(this.secret).catch()
      this.secrets$.subscribe((secrets) => {
        secrets.forEach((secret) => {
          //to remove the secret that was stored during creation
          if (secret.label === '') {
            this.secretsService.remove(secret)
          }
        })
      })
    } catch (error) {
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error)

      // TODO: Show error
      return
    }

    await this.dismiss()
    if (this.flow === 'generate') {
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
      .routeWithState(`/social-recovery-setup/${this.secretID}`, { secret: this.secret })
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
