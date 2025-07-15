import { IACContext } from '@airgap/angular-core'
import { AirGapWallet, IAirGapTransaction, ProtocolSymbols, SignedTransaction, UnsignedTransaction } from '@airgap/coinlib-core'
import { MessageSignRequest, MessageSignResponse } from '@airgap/serializer'

export enum Mode {
  SIGN_TRANSACTION = 0,
  SIGN_MESSAGE = 1
}

/**************** Task ****************/

export type Task = 'signTransaction' | 'signMessage' | 'generic'

/**************** Alert ****************/

export interface Bip39PassphraseAlert {
  type: 'bip39Passphrase'
}

export interface Bip39PassphraseErrorAlert {
  type: 'bip39PassphraseError'
}

export interface SecretNotFoundErrorAlert {
  type: 'secretNotFound'
}

export interface UnknownErrorAlert {
  type: 'unknownError'
  message?: string
}

export type Alert = Bip39PassphraseAlert | Bip39PassphraseErrorAlert | SecretNotFoundErrorAlert | UnknownErrorAlert

/**************** Modal ****************/

export type Modal = 'selectSigningAccount'

/**************** DeserializedTransasction ****************/

export interface DeserializedUnsignedTransaction {
  type: 'unsigned'
  id: number
  details: IAirGapTransaction[]
  data: UnsignedTransaction
  iacContext?: IACContext
  wallet: AirGapWallet
  originalProtocolIdentifier?: ProtocolSymbols
}

export interface DeserializedSignedTransaction {
  type: 'signed'
  id: number
  details: IAirGapTransaction[]
  data: SignedTransaction & Pick<UnsignedTransaction, 'callbackURL'>
  iacContext?: IACContext
  wallet: AirGapWallet
  originalProtocolIdentifier?: ProtocolSymbols
}

export type DeserializedTransaction = DeserializedUnsignedTransaction | DeserializedSignedTransaction

export function isDeserializedTransaction(data: unknown): data is DeserializedTransaction {
  return data instanceof Object && 'type' in data && 'details' in data && 'data' in data && 'wallet' in data
}

/**************** DeserializedMessage ****************/

export interface DeserializedUnsignedMessage {
  type: 'unsigned'
  id: number
  protocol: ProtocolSymbols | undefined
  data: MessageSignRequest
  iacContext?: IACContext
  blake2bHash: string | undefined
  wallet: AirGapWallet | undefined
  originalProtocolIdentifier?: ProtocolSymbols
}

export interface DeserializedSignedMessage {
  type: 'signed'
  id: number
  protocol: ProtocolSymbols | undefined
  data: MessageSignResponse & Pick<MessageSignRequest, 'callbackURL'>
  iacContext?: IACContext
  wallet: AirGapWallet | undefined
  originalProtocolIdentifier?: ProtocolSymbols
}

export type DeserializedMessage = DeserializedUnsignedMessage | DeserializedSignedMessage

/**************** DeserializedPayload ****************/

export interface SignTransactionPayload {
  mode: Mode.SIGN_TRANSACTION
  data: DeserializedUnsignedTransaction[]
}

export interface SignMessagePayload {
  mode: Mode.SIGN_MESSAGE
  data: DeserializedUnsignedMessage[]
}

export type Payload = SignTransactionPayload | SignMessagePayload

/**************** Resources ****************/

export interface UnsignedMessage {
  data: string
  blake2bHash?: string
}
