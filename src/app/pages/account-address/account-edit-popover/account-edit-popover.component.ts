import { SecretsService } from './../../../services/secrets/secrets.service'
import { ClipboardService } from './../../../services/clipboard/clipboard.service'
import { handleErrorLocal, ErrorCategory } from './../../../services/error-handler/error-handler.service'
import { Component } from '@angular/core'
import { AlertController, NavParams, ModalController } from '@ionic/angular'
import { AirGapWallet } from 'airgap-coin-lib'
import { TranslateService } from '@ngx-translate/core'

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
  private wallet: AirGapWallet
  private onDelete: Function
  private walletShareUrl: string

  constructor(
    private alertCtrl: AlertController,
    private clipboardProvider: ClipboardService,
    private navParams: NavParams,
    private secretsProvider: SecretsService,
    private modalController: ModalController,
    private translateService: TranslateService
  ) {
    this.wallet = this.navParams.get('wallet')
    this.onDelete = this.navParams.get('onDelete')
    this.walletShareUrl = this.navParams.get('walletShareUrl')
  }

  async copyAddressToClipboard() {
    await this.clipboardProvider.copyAndShowToast(
      this.wallet.receivingPublicAddress,
      this.translateService.instant('wallet-edit-delete-popover.confirm_address_copy')
    )

    await this.modalController.dismiss()
  }

  async copyShareUrlToClipboard() {
    await this.clipboardProvider.copyAndShowToast(
      this.walletShareUrl,
      this.translateService.instant('wallet-edit-delete-popover.confirm_sync_code_copy')
    )

    await this.modalController.dismiss()
  }

  delete() {
    this.translateService
      .get([
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        'wallet-edit-delete-popover.account-removal_alert.delete_label'
      ])
      .subscribe(async values => {
        let title = values['wallet-edit-delete-popover.account-removal_alert.title']
        let message = values['wallet-edit-delete-popover.account-removal_alert.text']
        let text1 = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        let text2 = values['wallet-edit-delete-popover.account-removal_alert.delete_label']
        let alert = await this.alertCtrl.create({
          header: title,
          message: message,
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
