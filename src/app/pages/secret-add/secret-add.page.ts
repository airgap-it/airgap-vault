import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { UiEventService } from '@airgap/angular-core'

@Component({
  selector: 'airgap-secret-add',
  templateUrl: './secret-add.page.html',
  styleUrls: ['./secret-add.page.scss']
})
export class SecretAddPage {
  public isGenerating: boolean = false

  public isAndroid: boolean = false

  public secret: MnemonicSecret

  public lifehashData: string | undefined

  public isAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform,
    private readonly lifehashService: LifehashService,
    private readonly storageService: VaultStorageService,
    private readonly uiEventService: UiEventService
  ) {
    if (this.navigationService.getState()) {
      this.isGenerating = this.navigationService.getState().isGenerating
      this.secret = this.navigationService.getState().secret
      this.isAndroid = this.platform.is('android')

      this.lifehashService.generateLifehash(this.secret.fingerprint).then((data) => {
        this.lifehashData = data
      })
    }
  }

  public async confirm(): Promise<void> {
    try {
      await this.secretsService.addOrUpdateSecret(this.secret)
    } catch (error) {
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error)

      if (error.message !== 'Already added secret' /* a workaround to avoid prompting 2 alerts */) {
        await this.showErrorAlert()
      } else {
        this.navigationService.routeToSecretsTab()
      }
      return
    }

    this.navigationService.routeWithState('/account-add', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async togglePasscode(): Promise<void> {
    this.secret.isParanoia = !this.secret.isParanoia
  }

  private async showErrorAlert() {
    const alert = await this.uiEventService.getTranslatedAlert({
      header: 'secret-edit.error_alert.title',
      message: 'secret-edit.error_alert.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'secret-edit.error_alert.abort-button_label',
          handler: () => {
            this.navigationService.routeToSecretsTab()
          }
        },
        {
          text: 'secret-edit.error_alert.retry-button_label',
          role: 'cancel'
        }
      ]
    })

    await alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
