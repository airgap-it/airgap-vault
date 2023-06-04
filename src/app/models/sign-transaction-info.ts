import { AirGapWallet } from '@airgap/coinlib-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { MnemonicSecret } from './secret'

export interface SignTransactionInfo {
  wallet: AirGapWallet
  signTransactionRequest: IACMessageDefinitionObjectV3
  secret: MnemonicSecret
}
