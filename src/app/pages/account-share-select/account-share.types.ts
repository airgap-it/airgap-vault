import { ProtocolSymbols } from '@airgap/coinlib-core'

/**************** Alert ****************/
export interface Bip39PassphraseAlert {
  type: 'bip39Passphrase'
  secretLabel: string
  protocolIdentifier: ProtocolSymbols
}

export interface Bip39PassphraseErrorAlert {
  type: 'bip39PassphraseError'
  secretLabel: string
  protocolIdentifier: ProtocolSymbols
}

export interface UnknownErrorAlert {
  type: 'unknownError'
  message?: string
}

export type Alert = Bip39PassphraseAlert | Bip39PassphraseErrorAlert | UnknownErrorAlert
