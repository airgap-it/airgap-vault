import { TransactionParameter } from './transactionparameters'
import { IAirGapTransaction } from 'airgap-coin-lib'
import BigNumber from 'bignumber.js'

export class Transaction implements IAirGapTransaction {
  amount: BigNumber
  blockHeight: string
  data: string
  fee: BigNumber
  from: string[]
  hash: string
  isInbound: boolean
  meta: {}
  protocolIdentifier: string
  to: string[]
  timestamp: number

  information: TransactionParameter[] = []

  payload: string
  publicKey: string
}
