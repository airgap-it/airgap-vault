import { Component } from '@angular/core'

import { AlertController, ModalController, ToastController } from '@ionic/angular'
import { Secret } from '../../models/secret'
import { Observable } from 'rxjs'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secrets',
  templateUrl: './tab-secrets.page.html',
  styleUrls: ['./tab-secrets.page.scss']
})
export class TabSecretsPage {
  public secrets: Observable<Secret[]>

  constructor(
    public modalController: ModalController,
    public navigationService: NavigationService,
    // private popoverCtrl: PopoverController,
    private secretsService: SecretsService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  ionViewWillEnter() {
    // this.secrets.subscribe(async (list) => {
    //   await this.secretsProvider.isReady()
    //   if (list.length === 0) {
    //     this.navController.push(SecretCreatePage)
    //   }
    // })
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

  // deleteSecret(_secret: Secret) {
  // this.alertController
  //   .create({
  //     title: 'Delete ' + secret.label,
  //     subTitle: 'Are you sure you want to delete ' + secret.label + '?',
  //     buttons: [
  //       {
  //         text: 'Delete',
  //         handler: () => {
  //           this.secretsProvider.remove(secret)
  //           let toast = this.toastController.create({
  //             message: 'Secret deleted',
  //             duration: 5000,
  //             showCloseButton: true,
  //             closeButtonText: 'Undo'
  //           })
  //           toast.onDidDismiss((data, role) => {
  //             if (role === 'close') {
  //               this.secretsProvider.addOrUpdateSecret(secret)
  //             }
  //           })
  //           toast.present()
  //         }
  //       },
  //       {
  //         text: 'Cancel'
  //       }
  //     ]
  //   })
  //   .present()
  // }

  presentAboutPopover(_event) {
    //   let popover = this.popoverCtrl.create(AboutPopoverComponent)
    //   popover.present({
    //     ev: event
    //   })
  }
}
