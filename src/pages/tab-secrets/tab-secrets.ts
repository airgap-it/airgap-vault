import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, ToastController, ModalController, PopoverController } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'
import { SecretCreatePage } from '../secret-create/secret-create'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { Observable } from 'rxjs'
import { AboutPopoverComponent } from './about-popover/about-popover.component'

@IonicPage()
@Component({
  selector: 'page-tab-secrets',
  templateUrl: 'tab-secrets.html'
})
export class TabSecretsPage {
  private secrets: Observable<Secret[]>

  constructor(
    public modalController: ModalController,
    public navController: NavController,
    private popoverCtrl: PopoverController,
    private secretsProvider: SecretsProvider,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  ionViewWillEnter() {
    this.secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
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
    this.alertController
      .create({
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
      })
      .present()
  }

  presentAboutPopover(event) {
    let popover = this.popoverCtrl.create(AboutPopoverComponent)
    popover.present({
      ev: event
    })
  }
}
