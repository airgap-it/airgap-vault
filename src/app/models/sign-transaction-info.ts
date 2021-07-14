import { AirGapWallet, IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'

export interface SignTransactionInfo {
  wallet: AirGapWallet
  signTransactionRequest: IACMessageDefinitionObjectV3
}
