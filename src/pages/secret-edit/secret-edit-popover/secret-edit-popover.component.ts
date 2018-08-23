import { Component } from '@angular/core'
import { ViewController, NavParams, AlertController } from 'ionic-angular'
import { Secret } from '../../../models/secret'
import { SecretsProvider } from '../../../providers/secrets/secrets.provider'

@Component({
  template: `
      <ion-list no-lines no-detail>
        <ion-list-header>Settings</ion-list-header>
        <button ion-item detail-none (click)='delete()'>
            <ion-icon name='trash' color='dark' item-end></ion-icon>
            Delete
        </button>
      </ion-list>
    `
})

export class SecretEditPopoverComponent {

  private secret: Secret
  private onDelete: Function

  constructor(private alertCtrl: AlertController, private navParams: NavParams, private secretsProvider: SecretsProvider, private viewCtrl: ViewController) {
    this.secret = this.navParams.get('secret')
    this.onDelete = this.navParams.get('onDelete')
  }

  delete() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Secret Removal',
      message: 'Do you want to remove this secret? You won\'t be able to restore it without backup!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.viewCtrl.dismiss()
          }
        },
        {
          text: 'Delete',
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
  }
}
