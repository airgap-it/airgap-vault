import { Component } from '@angular/core'
import { AlertController, PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet } from 'airgap-coin-lib'

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
    private readonly clipboardProvider: ClipboardService,
    private readonly secretsProvider: SecretsService,
    private readonly popoverController: PopoverController,
    private readonly translateService: TranslateService
  ) {}

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardProvider.copyAndShowToast(
      this.wallet.receivingPublicAddress,
      this.translateService.instant('wallet-edit-delete-popover.confirm_address_copy')
    )

    await this.popoverController.dismiss()
  }

  public async copyShareUrlToClipboard(): Promise<void> {
    await this.clipboardProvider.copyAndShowToast(
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
      .subscribe(async (values: string[]) => {
        const title: string = values['wallet-edit-delete-popover.account-removal_alert.title']
        const message: string = values['wallet-edit-delete-popover.account-removal_alert.text']
        const text1: string = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        const text2: string = values['wallet-edit-delete-popover.account-removal_alert.delete_label']

        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: title,
          message,
          buttons: [
            {
              text: text1,
              role: 'cancel',
              handler: (): void => {
                this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
              }
            },
            {
              text: text2,
              handler: (): void => {
                alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
                this.secretsProvider
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
