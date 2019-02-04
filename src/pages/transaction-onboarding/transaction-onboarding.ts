import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { Transaction } from '../../models/transaction.model'
import { Storage } from '@ionic/storage'
import { AirGapWallet } from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-transaction-onboarding',
  templateUrl: 'transaction-onboarding.html'
})
export class TransactionOnboardingPage {
  private transaction: Transaction
  private wallet: AirGapWallet

  disclaimerHidden = false

  constructor(public navController: NavController, public navParams: NavParams, private storage: Storage) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
  }

  async ngOnInit() {
    this.disclaimerHidden = await this.storage.get('DISCLAIMER_HIDE_SIGN_TX')
  }

  public async hideDisclaimer() {
    this.disclaimerHidden = true
    await this.storage.set('DISCLAIMER_HIDE_SIGN_TX', true)
    this.goToTransactionSignedPage()
  }

  public goToTransactionSignedPage() {
    this.navController
      .push(TransactionSignedPage, { transaction: this.transaction, wallet: this.wallet })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
