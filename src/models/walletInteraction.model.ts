import { AirGapWallet } from 'airgap-coin-lib'
import { Transaction } from './transaction.model'
export interface IWalletInteraction {
  communicationType: string
  url: string
  operationType: string
  signedTxQr?: string
  wallet?: AirGapWallet
  transaction?: Transaction
}
