import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import {
  AirGapWallet,
  UnsignedTransaction,
  IAirGapTransaction
} from 'airgap-coin-lib'

enum TransactionQRType {
  SignedAirGap = 0,
  SignedRaw = 1
}

@IonicPage()
@Component({
  selector: 'page-transaction-signed',
  templateUrl: 'transaction-signed.html'
})
export class TransactionSignedPage {
  signedTx?: string
  broadcastUrl?: string

  transaction: UnsignedTransaction
  airGapTx: IAirGapTransaction
  wallet: AirGapWallet

  qrType: TransactionQRType = 0

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) {
    this.broadcastUrl = this.navParams.get('broadcastUrl')
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.signedTx = this.navParams.get('signedTxQr')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  done() {
    this.navCtrl.popToRoot().then(null)
  }
}
