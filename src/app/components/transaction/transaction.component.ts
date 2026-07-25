import { IAirGapTransaction, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { parseERC20Data } from 'src/app/utils/erc20-data-parser'

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
  public readonly rawData: Map<IAirGapTransaction, [string, string]> = new Map()

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

  public toggleData(tx: IAirGapTransaction): void {
    const raw: [string, string] | undefined = this.rawData.get(tx)
    if (raw !== undefined) {
      const restoredTx: IAirGapTransaction = { ...tx, data: raw[0], to: [raw[1], ...tx.to.slice(1)] }
      this.rawData.delete(tx)
      this.replaceTransaction(tx, restoredTx)

      return
    }

    const parsed: [string, string] | undefined = parseERC20Data(tx.data, tx.to[0])
    if (parsed === undefined) {
      return
    }

    const parsedTx: IAirGapTransaction = { ...tx, data: parsed[0], to: [parsed[1], ...tx.to.slice(1)] }
    this.rawData.set(parsedTx, [tx.data, tx.to[0]])
    this.replaceTransaction(tx, parsedTx)
  }

  private replaceTransaction(current: IAirGapTransaction, replacement: IAirGapTransaction): void {
    if (this.airGapTxs === undefined) {
      return
    }

    this.airGapTxs[this.airGapTxs.indexOf(current)] = replacement
    this.store.setAirGapTxs([...this.airGapTxs])
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
