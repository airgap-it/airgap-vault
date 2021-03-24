/**************** Alert ****************/

import { AirGapWallet } from '@airgap/coinlib-core'

export interface ParanoiaInfoAlert {
  type: 'paranoiaInfo'
  label: string
}

export interface Bip39PassphraseAlert {
  type: 'bip39Passphrase'
  protocolName: string
  address: string
}

export interface UnknownErrorAlert {
  type: 'unknownError'
  message?: string
}

export type Alert = ParanoiaInfoAlert | Bip39PassphraseAlert | UnknownErrorAlert

/**************** Resources ****************/

export type MigrationStatus = 'waiting' | 'migrating' | 'migrated' | 'skipped'
export type GroupMigrationStatus = MigrationStatus | 'partiallyMigrated'

export interface MigrationWallet {
  status: MigrationStatus
  data: AirGapWallet
}

export interface MigrationWalletGroup {
  id: string
  label: string
  status: GroupMigrationStatus
  wallets: MigrationWallet[]
}
