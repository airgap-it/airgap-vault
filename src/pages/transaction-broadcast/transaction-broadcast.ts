import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { Transaction } from '../../models/transaction.model'
import { Storage } from '@ionic/storage'
import { AirGapWallet } from 'airgap-coin-lib'

declare var window: any

@IonicPage()
@Component({
  selector: 'page-transaction-broadcast',
  templateUrl: 'transaction-broadcast.html'
})
export class TransactionBroadcastPage {
  signedTxQr?: string
  broadcastUrl?: string

  private transaction: Transaction
  private wallet: AirGapWallet
  private platform: Platform

  constructor(public navController: NavController, public navParams: NavParams, private storage: Storage) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
  }

  sameDeviceBroadcast() {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: this.broadcastUrl,
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(this.broadcastUrl)
    }

    sApp.start(
      () => {
        console.log('OK')
      },
      error => {
        console.warn(error)
        alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
      }
    )
  }

  public goToTransactionSignedPage() {
    this.navController.push(TransactionSignedPage, { transaction: this.transaction, wallet: this.wallet, broadcastUrl: this.broadcastUrl, signedTxQr:this.navParams.get('signedTxQr')})
  }
}
