import { Component, Input } from '@angular/core'
import { Transaction } from '../../models/transaction.model'
import { AirGapWallet } from 'airgap-coin-lib'

@Component({
  selector: 'from-to',
  templateUrl: 'from-to.html'
})
export class FromToComponent {
  @Input()
  transaction: Transaction

  @Input()
  wallet: AirGapWallet

  constructor() {}
}
