import { sumAirGapTxValues } from '@airgap/angular-core'
import { IAirGapTransaction, ProtocolSymbols } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import BigNumber from 'bignumber.js'

export interface AggregatedDetails {
  numberOfTxs: number
  totalAmount: BigNumber
  totalFees: BigNumber
}

export interface TransactionState {
  protocolIdentifier: ProtocolSymbols | undefined
  airGapTxs: IAirGapTransaction[]
  aggregatedDetails: AggregatedDetails | undefined
}

const initialState: TransactionState = {
  protocolIdentifier: undefined,
  airGapTxs: [],
  aggregatedDetails: undefined
}

@Injectable()
export class TransactionStore extends ComponentStore<TransactionState> {
  constructor() {
    super(initialState)
  }

  public selectProtocolIdentifier() {
    return this.select((state: TransactionState) => state.protocolIdentifier)
  }

  public selectAirGapTxs() { 
    return this.select((state: TransactionState) => state.airGapTxs)
  }

  public selectAggregatedDetails() {
    return this.select((state: TransactionState) => state.aggregatedDetails)
  }

  public readonly setAirGapTxs = this.updater((_state: TransactionState, airGapTxs: IAirGapTransaction[]) => ({
    protocolIdentifier: airGapTxs[0].protocolIdentifier,
    airGapTxs,
    aggregatedDetails: {
      numberOfTxs: airGapTxs.length,
      totalAmount: new BigNumber(sumAirGapTxValues(airGapTxs, 'amount')),
      totalFees: new BigNumber(sumAirGapTxValues(airGapTxs, 'fee'))
    }
  }))
}