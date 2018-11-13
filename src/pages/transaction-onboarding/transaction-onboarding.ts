import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { Transaction } from '../../models/transaction.model'
import { Storage } from '@ionic/storage'
import { AirGapWallet } from 'airgap-coin-lib'

@IonicPage()
@Component({
  selector: 'page-transaction-onboarding',
  templateUrl: 'transaction-onboarding.html'
})
export class TransactionOnboardingPage {
  private transaction: Transaction
  private wallet: AirGapWallet
  private hideNextTime = false

  constructor(public navController: NavController, public navParams: NavParams, private storage: Storage) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
  }

  public hideDisclaimer() {
    this.hideNextTime = true
    this.storage.set('DISCLAIMER_HIDE_SIGN_TX', true)
  }

  public goToTransactionSignedPage() {
    this.navController.push(TransactionSignedPage, { transaction: this.transaction, wallet: this.wallet })
  }
}
