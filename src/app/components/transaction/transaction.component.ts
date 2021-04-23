import { IAirGapTransaction, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { AggregatedDetails, TransactionStore } from './transaction.store'

@Component({
  selector: 'airgap-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  providers: [TransactionStore]
})
export class TransactionComponent implements OnInit {
  @Input()
  public airGapTxs: IAirGapTransaction[] | undefined

  public protocolIdentifier$: Observable<ProtocolSymbols | undefined>
  public airGapTxs$: Observable<IAirGapTransaction[]>
  public aggregatedDetails$: Observable<AggregatedDetails | undefined>

  constructor(private readonly store: TransactionStore) {
    this.protocolIdentifier$ = this.store.selectProtocolIdentifier()
    this.airGapTxs$ = this.store.selectAirGapTxs()
    this.aggregatedDetails$ = this.store.selectAggregatedDetails()
  }

  public async ngOnInit(): Promise<void> {
    if (this.airGapTxs !== undefined) {
      this.store.setAirGapTxs(this.airGapTxs)
    }
  }
}
