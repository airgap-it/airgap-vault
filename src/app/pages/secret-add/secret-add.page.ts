import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

// import { TranslateService } from '@ngx-translate/core'
// import { ClipboardService } from '@airgap/angular-core'

@Component({
  selector: 'airgap-secret-add',
  templateUrl: './secret-add.page.html',
  styleUrls: ['./secret-add.page.scss']
})
export class SecretAddPage {
  public isGenerating: boolean = false

  public isAndroid: boolean = false

  public secret: MnemonicSecret

  constructor(
    // private readonly alertCtrl: AlertController,
    // private readonly translateService: TranslateService,
    // private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform
  ) {
    if (this.navigationService.getState()) {
      this.isGenerating = this.navigationService.getState().isGenerating
      this.secret = this.navigationService.getState().secret

      this.isAndroid = this.platform.is('android')
    }
  }

  public async confirm(): Promise<void> {
    try {
      await this.secretsService.addOrUpdateSecret(this.secret)
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

  public async togglePasscode(): Promise<void> {
    this.secret.isParanoia = !this.secret.isParanoia
  }

  // private async showRecoveryKeyAlert(recoveryKey: string): Promise<void> {
  //   const alert: HTMLIonAlertElement = await this.alertCtrl.create({
  //     header: this.translateService.instant('secret-edit.secret-recovery-key.alert.title'),
  //     subHeader: this.translateService.instant('secret-edit.secret-recovery-key.description'),
  //     message: recoveryKey,
  //     buttons: [
  //       {
  //         text: this.translateService.instant('secret-edit.secret-recovery-key.alert.copy'),
  //         handler: () => {
  //           this.clipboardService.copy(recoveryKey)
  //         }
  //       },
  //       {
  //         text: this.translateService.instant('secret-edit.secret-recovery-key.alert.done'),
  //         handler: () => {}
  //       }
  //     ]
  //   })
  //   alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  // }
}
