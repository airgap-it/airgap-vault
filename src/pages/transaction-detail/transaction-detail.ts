import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { TransactionOnboardingPage } from '../transaction-onboarding/transaction-onboarding'
import { Storage } from '@ionic/storage'
import { AirGapWallet, UnsignedTransaction, IAirGapTransaction } from 'airgap-coin-lib'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html'
})
export class TransactionDetailPage {
  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTx: IAirGapTransaction

  constructor(public navController: NavController, public navParams: NavParams, private storage: Storage) {}

  ionViewWillEnter() {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  async goToTransactionOnboardingPage() {
    const val = await this.storage.get('DISCLAIMER_HIDE_SIGN_TX')
    if (val) {
      this.navController
        .push(TransactionSignedPage, { transaction: this.transaction, wallet: this.wallet })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.navController
        .push(TransactionOnboardingPage, { transaction: this.transaction, wallet: this.wallet })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
