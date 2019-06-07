import { Component } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'
import { AirGapWallet, DeserializedSyncProtocol } from 'airgap-coin-lib'

enum TransactionQRType {
  SignedAirGap = 0,
  SignedRaw = 1
}

@Component({
  selector: 'app-transaction-signed',
  templateUrl: './transaction-signed.page.html',
  styleUrls: ['./transaction-signed.page.scss']
})
export class TransactionSignedPage {
  public signedTx: string
  public interactionUrl: string

  public wallet: AirGapWallet
  public qrType: TransactionQRType = 0

  public signedTransactionSync: DeserializedSyncProtocol

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  public async ionViewWillEnter() {
    // this.interactionUrl = this.navParams.get('interactionUrl')
    // this.wallet = this.navParams.get('wallet')
    // this.signedTx = this.navParams.get('signedTx')
  }

  public switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  public done() {
    // this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
