import { Component } from '@angular/core'
import { AlertController, ToastController } from '@ionic/angular'
import { Observable } from 'rxjs'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ClipboardService, IACMessageTransport, SerializerService } from '@airgap/angular-core'
import { IACService } from 'src/app/services/iac/iac.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  public readonly secrets: Observable<MnemonicSecret[]>

  constructor(
    public readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly alertController: AlertController,
    private readonly toastController: ToastController,
    private readonly iacService: IACService,
    private readonly clipboardService: ClipboardService,
    private readonly navigationService: NavigationService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  public goToNewSecret(): void {
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToEditSecret(secret: MnemonicSecret): void {
    this.navigationService.routeWithState('/secret-edit', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionSettings(): void {
    this.navigationService.route('/interaction-selection-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async deleteSecret(secret: MnemonicSecret): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Delete ' + secret.label,
      subHeader: 'Are you sure you want to delete ' + secret.label + '?',
      buttons: [
        {
          text: 'Delete',
          handler: async () => {
            this.secretsService.remove(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))

            const toast: HTMLIonToastElement = await this.toastController.create({
              message: 'Secret deleted',
              duration: 5000,
              buttons: [
                {
                  text: 'Undo',
                  role: 'cancel'
                }
              ]
            })

            toast.onDidDismiss().then((role) => {
              if (role === 'close') {
                this.secretsService.addOrUpdateSecret(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
              }
            })

            toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
          }
        },
        {
          text: 'Cancel'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public goToAbout(): void {
    this.navigationService.route('/about').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionHistory(): void {
    this.navigationService.route('/interaction-history').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToQrSettings(): void {
    this.navigationService.route('/qr-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard(): void {
    this.clipboardService.paste().then(
      (text: string) => {
        console.log('pasteClipboard', text)
        this.iacService.handleRequest(text, IACMessageTransport.PASTE).catch((err) => console.error(err))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }
}
