import { Component } from '@angular/core'
import { ViewController, NavParams, AlertController } from 'ionic-angular'
import { Secret } from '../../../models/secret'
import { SecretsProvider } from '../../../providers/secrets/secrets.provider'
import { TranslateService } from '@ngx-translate/core'
import { handleErrorLocal, ErrorCategory } from '../../../providers/error-handler/error-handler'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>{{ 'secret-edit.small_popover.settings' | translate }}</ion-list-header>
      <button ion-item detail-none (click)="delete()">
        <ion-icon name="trash" color="dark" item-end></ion-icon>
        {{ 'secret-edit.small_popover.delete' | translate }}
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
    private translateService: TranslateService
  ) {
    this.secret = this.navParams.get('secret')
    this.onDelete = this.navParams.get('onDelete')
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
                this.viewCtrl.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
              }
            },
            {
              text: deleteButton,
              handler: () => {
                this.secretsProvider.remove(this.secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
                this.viewCtrl.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

                if (this.onDelete) {
                  this.onDelete()
                }
              }
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }
}
