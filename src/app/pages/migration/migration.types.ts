/**************** Alert ****************/

import { AirGapWallet } from '@airgap/coinlib-core'
import { MnemonicSecret } from 'src/app/models/secret'
import { groupWallets } from './migration.utils'

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

// a workaround for seamless migration to fully async `ICoinProtocol` interface
export class MigrationMnemonicSecret {

  public static async fromMnemonicSecret(mnemonicSecret: MnemonicSecret): Promise<MigrationMnemonicSecret> {
    const walletsGrouped = await groupWallets(mnemonicSecret.wallets)

    return new MigrationMnemonicSecret(walletsGrouped, mnemonicSecret)
  }

  constructor(public readonly walletsGrouped: AirGapWalletsGrouped, public readonly wrapped: MnemonicSecret) {}
}

export interface AirGapWalletsGrouped {
  [protocolIdentifier: string]: {
    [publicKey: string]: AirGapWallet
  }
}

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
