import { IAirGapTransaction } from 'airgap-coin-lib'

import { TransactionParameter } from './transactionparameters'

export class Transaction implements IAirGapTransaction {
  public amount: string
  public blockHeight: string
  public data: string
  public fee: string
  public from: string[]
  public hash: string
  public isInbound: boolean
  public meta: {}
  public protocolIdentifier: string
  public to: string[]
  public timestamp: number

  public information: TransactionParameter[] = []

  public payload: string
  public publicKey: string
}
