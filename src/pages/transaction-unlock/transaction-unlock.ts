import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { TransactionOnboardingPage } from '../transaction-onboarding/transaction-onboarding'
import { Transaction } from '../../models/transaction.model'

@IonicPage()
@Component({
  selector: 'page-transaction-unlock',
  templateUrl: 'transaction-unlock.html'
})
export class TransactionUnlockPage {
  private transaction: Transaction

  constructor(public navController: NavController, public navParams: NavParams) {
    this.transaction = this.navParams.get('transaction')
  }

  public goToTransactionOnboardingPage() {
    this.navController.push(TransactionOnboardingPage, { transaction: this.transaction })
  }
}
