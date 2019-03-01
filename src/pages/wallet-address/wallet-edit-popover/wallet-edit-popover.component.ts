import { Component } from '@angular/core'
import { AlertController, NavParams, ToastController, ViewController } from 'ionic-angular'
import { SecretsProvider } from '../../../providers/secrets/secrets.provider'
import { AirGapWallet } from 'airgap-coin-lib'
import { ClipboardProvider } from '../../../providers/clipboard/clipboard'
import { TranslateService } from '@ngx-translate/core'
import { handleErrorLocal, ErrorCategory } from '../../../providers/error-handler/error-handler'

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
export class WalletEditPopoverComponent {
  private wallet: AirGapWallet
  private onDelete: Function
  private walletShareUrl: string

  constructor(
    private alertCtrl: AlertController,
    private clipboardProvider: ClipboardProvider,
    private toastController: ToastController,
    private navParams: NavParams,
    private secretsProvider: SecretsProvider,
    private viewCtrl: ViewController,
    private translateService: TranslateService
  ) {
    this.wallet = this.navParams.get('wallet')
    this.onDelete = this.navParams.get('onDelete')
    this.walletShareUrl = this.navParams.get('walletShareUrl')
  }

  async copyAddressToClipboard() {
    this.translateService.get(['wallet-edit-delete-popover.confirm_address_copy']).subscribe(async values => {
      await this.clipboardProvider.copyAndShowToast(
        this.wallet.receivingPublicAddress,
        values['wallet-edit-delete-popover.confirm_address_copy']
      )
      await this.viewCtrl.dismiss()
    })
  }

  async copyShareUrlToClipboard() {
    this.translateService.get(['wallet-edit-delete-popover.confirm_sync_code_copy']).subscribe(async values => {
      await this.clipboardProvider.copyAndShowToast(this.walletShareUrl, values['wallet-edit-delete-popover.confirm_sync_code_copy'])
      await this.viewCtrl.dismiss()
    })
  }

  delete() {
    this.translateService
      .get([
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        'wallet-edit-delete-popover.account-removal_alert.delete_label'
      ])
      .subscribe(values => {
        let title = values['wallet-edit-delete-popover.account-removal_alert.title']
        let message = values['wallet-edit-delete-popover.account-removal_alert.text']
        let text1 = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        let text2 = values['wallet-edit-delete-popover.account-removal_alert.delete_label']
        let alert = this.alertCtrl.create({
          title: title,
          message: message,
          buttons: [
            {
              text: text1,
              role: 'cancel',
              handler: () => {
                this.viewCtrl.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
              }
            },
            {
              text: text2,
              handler: () => {
                alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
                this.secretsProvider
                  .removeWallet(this.wallet)
                  .then(() => {
                    this.viewCtrl.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
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
