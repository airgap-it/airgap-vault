import { Component, Input } from '@angular/core'

import { Transaction } from '../../models/transaction.model'

@Component({
  selector: 'from-to',
  templateUrl: './from-to.component.html',
  styleUrls: ['./from-to.component.scss']
})
export class FromToComponent {
  @Input()
  public transaction: Transaction

  constructor() {}
}
