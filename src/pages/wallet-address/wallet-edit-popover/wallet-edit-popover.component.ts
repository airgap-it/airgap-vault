import { Component } from '@angular/core'
import { AlertController, NavParams, ToastController, ViewController } from 'ionic-angular'
import { SecretsProvider } from '../../../providers/secrets/secrets.provider'
import { AirGapWallet } from 'airgap-coin-lib'
import { Clipboard } from '@ionic-native/clipboard'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>Wallet Settings</ion-list-header>
      <button ion-item detail-none (click)='copyAddressToClipboard()'>
        <ion-icon name='clipboard' color='dark' item-end></ion-icon>
        Copy address
      </button>
      <button ion-item detail-none (click)='delete()'>
        <ion-icon name='trash' color='dark' item-end></ion-icon>
        Delete
      </button>
    </ion-list>
  `
})

export class WalletEditPopoverComponent {

  private wallet: AirGapWallet
  private onDelete: Function

  constructor(private alertCtrl: AlertController, private clipboard: Clipboard, private toastController: ToastController, private navParams: NavParams, private secretsProvider: SecretsProvider, private viewCtrl: ViewController) {
    this.wallet = this.navParams.get('wallet')
    this.onDelete = this.navParams.get('onDelete')
  }

  async copyAddressToClipboard() {
    await this.clipboard.copy(this.wallet.receivingPublicAddress)
    let toast = this.toastController.create({
      message: 'Address was copied to your clipboard',
      duration: 2000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    await toast.present()
    await this.viewCtrl.dismiss()
  }

  delete() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Wallet Removal',
      message: 'Do you want to remove this wallet? You can always add it back later, if you know its correct derivation path/coin!',
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
            alert.present()
            this.secretsProvider.removeWallet(this.wallet).then(() => {
              this.viewCtrl.dismiss()
              if (this.onDelete) {
                this.onDelete()
              }
            })
          }
        }
      ]
    })
    alert.present()
  }

}
