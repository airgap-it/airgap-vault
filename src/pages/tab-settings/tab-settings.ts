import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, ToastController, ModalController } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'
import { SecretCreatePage } from '../secret-create/secret-create'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { Observable } from 'rxjs'
import { AboutPage } from '../about/about'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'
import { TranslateService } from '@ngx-translate/core'

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
    private translateService: TranslateService
  ) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  ionViewWillEnter() {
    this.secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })
  }

  goToNewSecret() {
    this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  goToEditSecret(secret: Secret) {
    this.navController.push(SecretEditPage, { secret: secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  deleteSecret(secret: Secret) {
    this.translateService
      .get(
        [
          'tab-settings.alert.title',
          'tab-settings.alert.subTitle',
          'tab-settings.alert.message',
          'tab-settings.alert.text',
          'tab-settings.alert.cancel',
          'tab-settings.alert.delete_text',
          'tab-settings.alert.undo'
        ],
        {
          secretLabel: secret.label
        }
      )
      .subscribe(values => {
        let title: string = values['tab-settings.alert.title']
        let subTitle: string = values['tab-settings.alert.subTitle']
        let message: string = values['tab-settings.alert.message']
        let cancel: string = values['tab-settings.alert.cancel']
        let delete_text: string = values['tab-settings.alert.delete_text']
        let undo: string = values['tab-settings.alert.undo']

        this.alertController
          .create({
            title: title,
            subTitle: subTitle,
            buttons: [
              {
                text: delete_text,
                handler: () => {
                  this.secretsProvider.remove(secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))

                  let toast = this.toastController.create({
                    message: message,
                    duration: 5000,
                    showCloseButton: true,
                    closeButtonText: undo
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
                text: cancel
              }
            ]
          })
          .present()
          .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }

  public about() {
    this.navController.push(AboutPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
