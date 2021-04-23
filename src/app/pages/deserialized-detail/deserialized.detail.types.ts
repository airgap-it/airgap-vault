import {
  AirGapWallet,
  IAirGapTransaction,
  MessageSignRequest,
  MessageSignResponse,
  ProtocolSymbols,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/coinlib-core'

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
  id: string
  details: IAirGapTransaction[]
  data: UnsignedTransaction
  wallet: AirGapWallet
}

export interface DeserializedSignedTransaction {
  type: 'signed'
  id: string
  details: IAirGapTransaction[]
  data: SignedTransaction & Pick<UnsignedTransaction, 'callbackURL'>
  wallet: AirGapWallet
}

export type DeserializedTransaction = DeserializedUnsignedTransaction | DeserializedSignedTransaction

export function isDeserializedTransaction(data: unknown): data is DeserializedTransaction {
  return data instanceof Object && 'type' in data && 'details' in data && 'data' in data && 'wallet' in data
}

/**************** DeserializedMessage ****************/

export interface DeserializedUnsignedMessage {
  type: 'unsigned'
  id: string
  protocol: ProtocolSymbols | undefined
  data: MessageSignRequest
  blake2bHash: string | undefined
  wallet: AirGapWallet | undefined
}

export interface DeserializedSignedMessage {
  type: 'signed'
  id: string
  protocol: ProtocolSymbols | undefined
  data: MessageSignResponse & Pick<MessageSignRequest, 'callbackURL'>
  wallet: AirGapWallet | undefined
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
