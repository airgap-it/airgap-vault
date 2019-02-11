import { InteractionProvider } from './../../providers/interaction/interaction'
import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, ToastController, ModalController } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'
import { SecretCreatePage } from '../secret-create/secret-create'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { Observable } from 'rxjs'
import { AboutPage } from '../about/about'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-tab-settings',
  templateUrl: 'tab-settings.html'
})
export class TabSettingsPage {
  private secrets: Observable<Secret[]>

  constructor(
    public modalController: ModalController,
    public navController: NavController,
    private secretsProvider: SecretsProvider,
    private alertController: AlertController,
    private toastController: ToastController,
    private interactionProvider: InteractionProvider
  ) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  ionViewWillEnter() {
    this.secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
      list.forEach(secret => {
        if (this.interactionProvider.getInteractionSettingOfSecret(secret)) {
          secret.hasInteractionSetting = true
        }
      })
    })
  }

  goToNewSecret() {
    this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  goToEditSecret(secret: Secret) {
    this.navController.push(SecretEditPage, { secret: secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  deleteSecret(secret: Secret) {
    this.alertController
      .create({
        title: 'Delete ' + secret.label,
        subTitle: 'Are you sure you want to delete ' + secret.label + '?',
        buttons: [
          {
            text: 'Delete',
            handler: () => {
              this.secretsProvider.remove(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))

              let toast = this.toastController.create({
                message: 'Secret deleted',
                duration: 5000,
                showCloseButton: true,
                closeButtonText: 'Undo'
              })

              toast.onDidDismiss((_data, role) => {
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
      .present()
      .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public about() {
    this.navController.push(AboutPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
