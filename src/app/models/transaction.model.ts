import { IAirGapTransaction } from 'airgap-coin-lib'
import BigNumber from 'bignumber.js'

import { TransactionParameter } from './transactionparameters'

export class Transaction implements IAirGapTransaction {
  public amount: BigNumber
  public blockHeight: string
  public data: string
  public fee: BigNumber
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
