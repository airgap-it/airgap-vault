import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular'
import { Transaction } from '../../models/transaction.model'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { TransactionOnboardingPage } from '../transaction-onboarding/transaction-onboarding'
import { Storage } from '@ionic/storage'
import { AirGapSchemeProvider } from '../../providers/scheme/scheme.service'
import { AirGapWallet } from 'airgap-coin-lib'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

/**
 * Generated class for the TransactionDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html'
})
export class TransactionDetailPage {

  private transaction: Transaction
  private wallet: AirGapWallet

  constructor(private alertController: AlertController, private schemeService: AirGapSchemeProvider, private secretsProvider: SecretsProvider, public navController: NavController, public navParams: NavParams, private storage: Storage) {

  }

  ionViewWillEnter() {
    if (this.navParams.get('data')) {
      try {
        let transaction = this.schemeService.extractAirGapTx(this.navParams.get('data'))
        this.wallet = this.secretsProvider.findWalletByPublicKeyAndProtocolIdentifier(transaction.publicKey, transaction.protocolIdentifier)
        this.transaction = transaction
      } catch (error) {
        console.warn(error)
        this.alertController.create({
          title: 'Hm...',
          message: 'We could not interpret this QR or Intent. Make sure you scanned the correct one.',
          buttons: [{
            text: 'Okay',
            handler: () => {
              this.navController.popToRoot()
            }
          }]
        }).present()
      }
    } else {
      this.transaction = this.navParams.get('transaction')
      this.wallet = this.navParams.get('wallet')
    }
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
