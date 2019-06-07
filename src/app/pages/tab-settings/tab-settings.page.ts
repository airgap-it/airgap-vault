import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController, ToastController } from '@ionic/angular'
import { Observable } from 'rxjs'

import { Secret } from '../../models/secret'
import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage implements OnInit {
  public readonly secrets: Observable<Secret[]>

  constructor(
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

  public ngOnInit(): void {
    this.secrets.subscribe(async (secrets: Secret[]) => {
      if (secrets.length === 0) {
        this.router.navigateByUrl('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })
  }

  public goToNewSecret(): void {
    this.navigationService.route('/secret-create').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToEditSecret(secret: Secret): void {
    this.navigationService.routeWithState('/secret-edit', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async deleteSecret(secret: Secret): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Delete ' + secret.label,
      subHeader: 'Are you sure you want to delete ' + secret.label + '?',
      buttons: [
        {
          text: 'Delete',
          handler: async () => {
            this.secretsProvider.remove(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))

            const toast: HTMLIonToastElement = await this.toastController.create({
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
    this.navigationService.route('/about').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard(): void {
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
