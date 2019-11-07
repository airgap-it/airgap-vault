import { Component, Input } from '@angular/core'

import { Transaction } from '../../models/transaction.model'
import { IAirGapTransaction } from 'airgap-coin-lib';

@Component({
  selector: 'airgap-from-to',
  templateUrl: './from-to.component.html',
  styleUrls: ['./from-to.component.scss']
})
export class FromToComponent {
  @Input()
  public transaction: Transaction | IAirGapTransaction

  constructor() {}
}
