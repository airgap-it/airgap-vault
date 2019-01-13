import { Component } from '@angular/core'
import { ViewController, NavParams, AlertController, NavController } from 'ionic-angular'
import { Secret } from '../../../models/secret'
import { SecretsProvider } from '../../../providers/secrets/secrets.provider'
import { TranslateService } from '@ngx-translate/core'
import { SecretShowPage } from '../../secret-show/secret-show'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>Settings</ion-list-header>
      <button ion-item detail-none (click)="showSecret()">
        <ion-icon name="trash" color="dark" item-end></ion-icon>
        Show secret
      </button>
      <button ion-item detail-none (click)="delete()">
        <ion-icon name="trash" color="dark" item-end></ion-icon>
        Delete
      </button>
    </ion-list>
  `
})
export class SecretEditPopoverComponent {
  private secret: Secret
  private onDelete: Function

  constructor(
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private secretsProvider: SecretsProvider,
    private viewCtrl: ViewController,
    private translateService: TranslateService,
    private navCtrl: NavController
  ) {
    this.secret = this.navParams.get('secret')
    this.onDelete = this.navParams.get('onDelete')
  }

  showSecret() {
    this.secretsProvider
      .retrieveEntropyForSecret(this.secret)
      .then(entropy => {
        this.secret.secretHex = entropy
        this.viewCtrl.dismiss()
        this.navCtrl.push(SecretShowPage, { secret: this.secret, isRecover: true })
      })
      .catch(error => {
        console.warn(error)
      })
  }

  delete() {
    this.translateService
      .get([
        'secret-edit-delete-popover.title',
        'secret-edit-delete-popover.text',
        'secret-edit-delete-popover.cancel_label',
        'secret-edit-delete-popover.delete_label'
      ])
      .subscribe(values => {
        let title = values['secret-edit-delete-popover.title']
        let message = values['secret-edit-delete-popover.text']
        let cancelButton = values['secret-edit-delete-popover.cancel_label']
        let deleteButton = values['secret-edit-delete-popover.delete_label']
        let alert = this.alertCtrl.create({
          title: title,
          message: message,
          buttons: [
            {
              text: cancelButton,
              role: 'cancel',
              handler: () => {
                this.viewCtrl.dismiss()
              }
            },
            {
              text: deleteButton,
              handler: () => {
                this.secretsProvider.remove(this.secret)
                this.viewCtrl.dismiss()

                if (this.onDelete) {
                  this.onDelete()
                }
              }
            }
          ]
        })
        alert.present()
      })
  }
}
