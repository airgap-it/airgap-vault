import { AirGapWallet, IACMessageDefinitionObject } from '@airgap/coinlib-core'

export interface SignTransactionInfo {
  wallet: AirGapWallet 
  signTransactionRequest: IACMessageDefinitionObject
}
