import { IAirGapTransaction, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { ContactsService } from 'src/app/services/contacts/contacts.service'

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

  @Input()
  public rawdata: string | undefined

  public protocolIdentifier$: Observable<ProtocolSymbols | undefined>
  public airGapTxs$: Observable<IAirGapTransaction[]>
  public aggregatedDetails$: Observable<AggregatedDetails | undefined>

  constructor(private readonly store: TransactionStore, private readonly contactsService: ContactsService) {
    this.protocolIdentifier$ = this.store.selectProtocolIdentifier()
    this.airGapTxs$ = this.store.selectAirGapTxs()
    this.aggregatedDetails$ = this.store.selectAggregatedDetails()
  }

  public async ngOnInit(): Promise<void> {
    if (this.airGapTxs !== undefined) {
      await this.setAddressNames()
      this.store.setAirGapTxs(this.airGapTxs)
    }
  }

  public async ngOnChanges() {
    await this.setAddressNames()
    this.store.setAirGapTxs(this.airGapTxs)
  }

  private async setAddressNames() {
    const isBookenabled = await this.contactsService.isBookEnabled()
    if (isBookenabled) {
      for (let i = 0; i < this.airGapTxs.length; i++) {
        this.airGapTxs[i].extra = { names: {} }
        for (let j = 0; j < this.airGapTxs[i].from.length; j++) {
          const address = this.airGapTxs[i].from[j]
          const name = await this.contactsService.getContactName(address)
          if (name) this.airGapTxs[i].extra.names[address] = name
        }

        for (let j = 0; j < this.airGapTxs[i].to.length; j++) {
          const address = this.airGapTxs[i].to[j]
          const name = await this.contactsService.getContactName(address)
          if (name) this.airGapTxs[i].extra.names[address] = name
        }
      }
    }
  }
}
