import { Component, Input } from '@angular/core'
import { Transaction } from '../../models/transaction.model'

@Component({
  selector: 'from-to',
  templateUrl: 'from-to.html'
})
export class FromToComponent {
  @Input()
  transaction: Transaction

  constructor() { }
}
