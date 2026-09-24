import { ProtocolService } from '@airgap/angular-core'
import { IAirGapTransaction, ICoinSubProtocol, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { ContactsService } from 'src/app/services/contacts/contacts.service'

import { EvmTransactionInput, RenderResult } from '../../services/evm/abi-types'
import { chainIdForProtocol, isEvmProtocol, isEvmSubProtocol } from '../../services/evm/protocol-mapping'
import { EvmTransactionRendererService } from '../../services/evm/transaction-renderer.service'

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

  private readonly evmResultsSubject = new BehaviorSubject<(RenderResult | null)[]>([])
  public readonly evmResults$ = this.evmResultsSubject.asObservable()
  private readonly dbDateSubject = new BehaviorSubject<string | undefined>(undefined)
  public readonly dbDate$ = this.dbDateSubject.asObservable()
  private decodeRun = 0

  constructor(
    private readonly store: TransactionStore,
    private readonly contactsService: ContactsService,
    private readonly evmRenderer: EvmTransactionRendererService,
    private readonly protocolService: ProtocolService
  ) {
    this.protocolIdentifier$ = this.store.selectProtocolIdentifier()
    this.airGapTxs$ = this.store.selectAirGapTxs()
    this.aggregatedDetails$ = this.store.selectAggregatedDetails()
  }

  public async ngOnInit(): Promise<void> {
    if (this.airGapTxs !== undefined) {
      await this.setAddressNames()
      this.store.setAirGapTxs(this.airGapTxs)
      await this.decodeEvm()
    }
  }

  public async ngOnChanges() {
    await this.setAddressNames()
    this.store.setAirGapTxs(this.airGapTxs)
    await this.decodeEvm()
  }

  private async decodeEvm(): Promise<void> {
    // ngOnInit and every ngOnChanges start a run; only the latest may publish.
    const run = ++this.decodeRun
    if (!this.airGapTxs) {
      this.evmResultsSubject.next([])
      return
    }
    const results = await Promise.all(
      this.airGapTxs.map(async tx => {
        if (!isEvmProtocol(tx.protocolIdentifier)) return null
        const data = tx.data
        if (!data || data === '0x' || data.length <= 2) return null
        let to: string | undefined
        if (isEvmSubProtocol(tx.protocolIdentifier)) {
          // Token protocols replace `to` with the token recipient; the called
          // contract is the protocol's own. Unknown stays unknown, never the recipient.
          to = await this.tokenContractAddress(tx)
        } else {
          to = tx.to?.[0]
          if (!to) return null
        }
        const input: EvmTransactionInput = { to, data, chainId: chainIdForProtocol(tx.protocolIdentifier) }
        try {
          await this.evmRenderer.prepare(input)
          return this.evmRenderer.render(input)
        } catch (e) {
          console.warn('EVM decode failed', e)
          return this.evmRenderer.renderRaw(input)
        }
      })
    )
    if (run !== this.decodeRun) return
    this.evmResultsSubject.next(results)
    const meta = results.some(r => r) ? await this.evmRenderer.getDbMetadata() : undefined
    if (run !== this.decodeRun) return
    this.dbDateSubject.next(meta?.sourcifyExportDate)
  }

  private async tokenContractAddress(tx: IAirGapTransaction): Promise<string | undefined> {
    try {
      const protocol = (await this.protocolService.getProtocol(tx.protocolIdentifier, tx.network, false)) as ICoinSubProtocol
      return (await protocol.getContractAddress?.()) || undefined
    } catch {
      return undefined
    }
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
