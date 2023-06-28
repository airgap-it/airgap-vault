import { Component } from '@angular/core'
import { AlertController, PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'

import { MnemonicSecret } from '../../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../../services/error-handler/error-handler.service'
import { SecretsService } from '../../../services/secrets/secrets.service'

//TODO Tim: refactor for accounts-list

@Component({
  selector: 'airgap-secret-edit-popover',
  templateUrl: './secret-edit-popover.component.html',
  styleUrls: ['./secret-edit-popover.component.scss']
})
export class SecretEditPopoverComponent {
  private readonly secret: MnemonicSecret
  private readonly onDelete: Function

  constructor(
    private readonly alertCtrl: AlertController,
    private readonly secretsService: SecretsService,
    private readonly popoverController: PopoverController,
    private readonly translateService: TranslateService
  ) {}

  public delete(): void {
    this.translateService
      .get([
        'secret-edit-delete-popover.title',
        'secret-edit-delete-popover.text',
        'secret-edit-delete-popover.cancel_label',
        'secret-edit-delete-popover.delete_label'
      ])
      .pipe(first())
      .subscribe(async (values: string[]) => {
        const title: string = values['secret-edit-delete-popover.title']
        const message: string = values['secret-edit-delete-popover.text']
        const cancelButton: string = values['secret-edit-delete-popover.cancel_label']
        const deleteButton: string = values['secret-edit-delete-popover.delete_label']

        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: title,
          message,
          buttons: [
            {
              text: cancelButton,
              role: 'cancel',
              handler: (): void => {
                this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
              }
            },
            {
              text: deleteButton,
              handler: (): void => {
                this.secretsService.remove(this.secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
                this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

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
