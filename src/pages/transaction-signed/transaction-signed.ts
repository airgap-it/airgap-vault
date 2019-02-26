import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { AirGapWallet, SignedTransaction, IAirGapTransaction, UnsignedTransaction } from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'
import { ClipboardProvider } from '../../providers/clipboard/clipboard'

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private clipboardProvider: ClipboardProvider) {}

  async ionViewWillEnter() {
    this.interactionUrl = this.navParams.get('interactionUrl')
    this.wallet = this.navParams.get('wallet')
    this.signedTx = this.navParams.get('signedTx')
    const transaction: UnsignedTransaction = this.navParams.get('transaction')
    try {
      this.airGapTx = await this.wallet.coinProtocol.getTransactionDetails(transaction)
    } catch (e) {
      console.warn(e)
    }
  }

  public switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  public done() {
    this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
