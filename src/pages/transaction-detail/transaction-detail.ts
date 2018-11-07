import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular'
import { Transaction } from '../../models/transaction.model'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { TransactionOnboardingPage } from '../transaction-onboarding/transaction-onboarding'
import { Storage } from '@ionic/storage'
import { AirGapSchemeProvider } from '../../providers/scheme/scheme.service'
import { AirGapWallet, UnsignedTransaction, IAirGapTransaction } from 'airgap-coin-lib'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html'
})
export class TransactionDetailPage {

  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTx: IAirGapTransaction

  constructor(private alertController: AlertController, private schemeService: AirGapSchemeProvider, private secretsProvider: SecretsProvider, public navController: NavController, public navParams: NavParams, private storage: Storage) {}

  ionViewWillEnter() {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  goToTransactionOnboardingPage() {
    this.storage.get('DISCLAIMER_HIDE_SIGN_TX').then(val => {
      if (val) {
        this.navController.push(TransactionSignedPage, { transaction: this.transaction, wallet: this.wallet })
      } else {
        this.navController.push(TransactionOnboardingPage, { transaction: this.transaction, wallet: this.wallet })
      }
    })
  }

}
