import { Component } from '@angular/core'
import { AlertController, NavController, ToastController, ModalController } from '@ionic/angular'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { Secret } from '../../models/secret'
// import { SecretCreatePage } from '../secret-create/secret-create'
// import { SecretEditPage } from '../secret-edit/secret-edit'
import { Observable } from 'rxjs'
// import { AboutPage } from '../about/about'
import { handleErrorLocal, ErrorCategory } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'app-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  private secrets: Observable<Secret[]>

  constructor(
    public modalController: ModalController,
    public navController: NavController,
    private secretsProvider: SecretsService,
    private alertController: AlertController,
    private toastController: ToastController,
    private schemeRoutingProvider: SchemeRoutingService,
    private clipboardProvider: ClipboardService
  ) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  ionViewWillEnter() {
    this.secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        // TODO
        // this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })
  }

  goToNewSecret() {
    // TODO
    // this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  goToEditSecret(secret: Secret) {
    // TODO
    // this.navController.push(SecretEditPage, { secret: secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async deleteSecret(secret: Secret) {
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

  public about() {
    // TODO
    // this.navController.push(AboutPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard() {
    this.clipboardProvider.paste().then(
      (text: string) => {
        this.schemeRoutingProvider.handleNewSyncRequest(this.navController, text).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }
}
