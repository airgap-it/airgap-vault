import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { AirGapWallet, SignedTransaction, IAirGapTransaction, UnsignedTransaction } from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

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
  public signedTx: string
  public interactionUrl: string

  public airGapTx: IAirGapTransaction
  public wallet: AirGapWallet

  public qrType: TransactionQRType = 0

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.interactionUrl = this.navParams.get('interactionUrl')
    this.wallet = this.navParams.get('wallet')
    this.signedTx = this.navParams.get('signedTx')
    const transaction: UnsignedTransaction = this.navParams.get('transaction')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(transaction)
  }

  public switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  public done() {
    this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
