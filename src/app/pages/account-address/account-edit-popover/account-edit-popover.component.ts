import { Component } from '@angular/core'
import { AlertController, PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet } from 'airgap-coin-lib'
import { first } from 'rxjs/operators'

import { ClipboardService } from '../../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../../services/error-handler/error-handler.service'
import { SecretsService } from '../../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-account-edit-popover',
  templateUrl: 'account-edit-popover.component.html',
  styleUrls: ['./account-edit-popover.component.scss']
})
export class AccountEditPopoverComponent {
  private readonly wallet: AirGapWallet
  private readonly onDelete: Function
  private readonly walletShareUrl: string

  constructor(
    private readonly alertCtrl: AlertController,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly popoverController: PopoverController,
    private readonly translateService: TranslateService
  ) {}

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(
      this.wallet.receivingPublicAddress,
      this.translateService.instant('wallet-edit-delete-popover.confirm_address_copy')
    )

    await this.popoverController.dismiss()
  }

  public async copyShareUrlToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(
      this.walletShareUrl,
      this.translateService.instant('wallet-edit-delete-popover.confirm_sync_code_copy')
    )

    await this.popoverController.dismiss()
  }

  public delete(): void {
    this.translateService
      .get([
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        'wallet-edit-delete-popover.account-removal_alert.delete_label'
      ])
      .pipe(first())
      .subscribe(async (values: string[]) => {
        const title: string = values['wallet-edit-delete-popover.account-removal_alert.title']
        const message: string = values['wallet-edit-delete-popover.account-removal_alert.text']
        const cancelButton: string = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        const deleteButton: string = values['wallet-edit-delete-popover.account-removal_alert.delete_label']

        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: title,
          message,
          buttons: [
            {
              text: cancelButton,
              role: 'cancel',
              handler: (): void => {
                this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
              }
            },
            {
              text: deleteButton,
              handler: (): void => {
                alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
                this.secretsService
                  .removeWallet(this.wallet)
                  .then(() => {
                    this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
                    if (this.onDelete) {
                      this.onDelete()
                    }
                  })
                  .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
              }
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }
}
