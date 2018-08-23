import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, ToastController, ModalController } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'
import { SecretCreatePage } from '../secret-create/secret-create'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { Observable } from 'rxjs'

/**
 * Generated class for the TabSecretsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tab-secrets',
  templateUrl: 'tab-secrets.html'
})
export class TabSecretsPage {

  private secrets: Observable<Secret[]>

  constructor(public modalController: ModalController, public navController: NavController, private secretsProvider: SecretsProvider, private alertController: AlertController, private toastController: ToastController) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  ionViewWillEnter() {
    this.secrets.subscribe(list => {
      if (list.length === 0 && this.secretsProvider.storageRead) {
        this.navController.push(SecretCreatePage)
      }
    })
  }

  goToNewSecret() {
    this.navController.push(SecretCreatePage)
  }

  goToEditSecret(secret: Secret) {
    this.navController.push(SecretEditPage, { secret: secret })
  }

  deleteSecret(secret: Secret) {
    this.alertController.create({
      title: 'Delete ' + secret.label,
      subTitle: 'Are you sure you want to delete ' + secret.label + '?',
      buttons: [
        {
          text: 'Delete',
          handler: () => {
            this.secretsProvider.remove(secret)

            let toast = this.toastController.create({
              message: 'Secret deleted',
              duration: 5000,
              showCloseButton: true,
              closeButtonText: 'Undo'
            })

            toast.onDidDismiss((data, role) => {
              if (role === 'close') {
                this.secretsProvider.addOrUpdateSecret(secret)
              }
            })
            toast.present()
          }
        },
        {
          text: 'Cancel'
        }
      ]
    }).present()
  }
}
