import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController, ModalController, ToastController } from '@ionic/angular'
import { Observable } from 'rxjs'

import { Secret } from '../../models/secret'
import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  public readonly secrets: Observable<Secret[]>

  constructor(
    public modalController: ModalController,
    private readonly router: Router,
    private readonly secretsProvider: SecretsService,
    private readonly alertController: AlertController,
    private readonly toastController: ToastController,
    private readonly schemeRoutingProvider: SchemeRoutingService,
    private readonly clipboardProvider: ClipboardService,
    private readonly navigationService: NavigationService
  ) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  public ionViewWillEnter() {
    this.secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        // TODO
        // this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })
  }

  public goToNewSecret(): void {
    this.router.navigate(['secret-create']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToEditSecret(secret: Secret): void {
    this.navigationService.routeWithState('/secret-edit', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async deleteSecret(secret: Secret) {
    const alert = await this.alertController.create({
      header: 'Delete ' + secret.label,
      subHeader: 'Are you sure you want to delete ' + secret.label + '?',
      buttons: [
        {
          text: 'Delete',
          handler: async () => {
            this.secretsProvider.remove(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))

            const toast = await this.toastController.create({
              message: 'Secret deleted',
              duration: 5000,
              showCloseButton: true,
              closeButtonText: 'Undo'
            })

            toast.onDidDismiss().then(role => {
              if (role === 'close') {
                this.secretsProvider.addOrUpdateSecret(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
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
    this.router.navigate(['/about']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard() {
    this.clipboardProvider.paste().then(
      (text: string) => {
        this.schemeRoutingProvider.handleNewSyncRequest(text).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }
}
