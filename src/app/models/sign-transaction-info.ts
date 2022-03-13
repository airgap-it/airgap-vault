import { AirGapWallet, IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { MnemonicSecret } from './secret'

export interface SignTransactionInfo {
  wallet: AirGapWallet
  signTransactionRequest: IACMessageDefinitionObjectV3
  secret: MnemonicSecret
}
