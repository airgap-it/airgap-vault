import { Component } from '@angular/core'
import { AlertController, ModalController, NavParams } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet } from 'airgap-coin-lib'

import { ClipboardService } from './../../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from './../../../services/error-handler/error-handler.service'
import { SecretsService } from './../../../services/secrets/secrets.service'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>{{ 'wallet-edit-delete-popover.settings_label' | translate }}</ion-list-header>
      <button ion-item detail-none (click)="copyAddressToClipboard()">
        <ion-icon name="clipboard" color="dark" item-end></ion-icon>
        {{ 'wallet-edit-delete-popover.copy_label' | translate }}
      </button>
      <button ion-item detail-none (click)="copyShareUrlToClipboard()">
        <ion-icon name="clipboard" color="dark" item-end></ion-icon>
        {{ 'wallet-edit-delete-popover.copy_sync_code' | translate }}
      </button>
      <button ion-item detail-none (click)="delete()">
        <ion-icon name="trash" color="dark" item-end></ion-icon>
        {{ 'wallet-edit-delete-popover.account-removal_alert.delete_label' | translate }}
      </button>
    </ion-list>
  `
})
export class AccountEditPopoverComponent {
  private readonly wallet: AirGapWallet
  private readonly onDelete: Function
  private readonly walletShareUrl: string

  constructor(
    private readonly alertCtrl: AlertController,
    private readonly clipboardProvider: ClipboardService,
    private readonly navParams: NavParams,
    private readonly secretsProvider: SecretsService,
    private readonly modalController: ModalController,
    private readonly translateService: TranslateService
  ) {
    this.wallet = this.navParams.get('wallet')
    this.onDelete = this.navParams.get('onDelete')
    this.walletShareUrl = this.navParams.get('walletShareUrl')
  }

  public async copyAddressToClipboard() {
    await this.clipboardProvider.copyAndShowToast(
      this.wallet.receivingPublicAddress,
      this.translateService.instant('wallet-edit-delete-popover.confirm_address_copy')
    )

    await this.modalController.dismiss()
  }

  public async copyShareUrlToClipboard() {
    await this.clipboardProvider.copyAndShowToast(
      this.walletShareUrl,
      this.translateService.instant('wallet-edit-delete-popover.confirm_sync_code_copy')
    )

    await this.modalController.dismiss()
  }

  public delete() {
    this.translateService
      .get([
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        'wallet-edit-delete-popover.account-removal_alert.delete_label'
      ])
      .subscribe(async values => {
        const title = values['wallet-edit-delete-popover.account-removal_alert.title']
        const message = values['wallet-edit-delete-popover.account-removal_alert.text']
        const text1 = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        const text2 = values['wallet-edit-delete-popover.account-removal_alert.delete_label']
        const alert = await this.alertCtrl.create({
          header: title,
          message,
          buttons: [
            {
              text: text1,
              role: 'cancel',
              handler: () => {
                this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
              }
            },
            {
              text: text2,
              handler: () => {
                alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
                this.secretsProvider
                  .removeWallet(this.wallet)
                  .then(() => {
                    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
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
