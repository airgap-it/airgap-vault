import { AirGapWallet, ProtocolSymbols } from '@airgap/coinlib-core'

import { MnemonicSecret } from '../../models/secret'
import { isWalletMigrated } from '../../utils/migration'

import { AirGapWalletsGrouped, GroupMigrationStatus, MigrationStatus, MigrationWallet } from './migration.types'

export function getWalletMigrationStatus(
  wallet: AirGapWallet,
  options: { currentlyHandled: string | undefined; alreadyHandled: Set<string> }
): MigrationStatus {
  if (wallet.publicKey === options.currentlyHandled) {
    return 'migrating'
  }

  if (options.alreadyHandled.has(wallet.publicKey)) {
    return isWalletMigrated(wallet) ? 'migrated' : 'skipped'
  }

  return 'waiting'
}

export function getWalletGroupMigrationStatus(
  secret: MnemonicSecret,
  wallets: MigrationWallet[],
  options: { currentlyHandled: string | undefined }
): GroupMigrationStatus {
  const statusCounter: Record<MigrationStatus, number> = {
    waiting: 0,
    migrating: 0,
    migrated: 0,
    skipped: 0
  }

  wallets.forEach((wallet: MigrationWallet) => {
    statusCounter[wallet.status]++
  })

  if (secret.id === options.currentlyHandled) {
    return 'migrating'
  } else if (statusCounter.migrated === wallets.length) {
    return 'migrated'
  } else if (statusCounter.skipped === wallets.length) {
    return 'skipped'
  } else if (statusCounter.waiting === wallets.length) {
    return 'waiting'
  } else if (statusCounter.migrating > 0) {
    return 'migrating'
  } else if (statusCounter.migrated + statusCounter.skipped === wallets.length) {
    return 'partiallyMigrated'
  } else {
    return 'waiting'
  }
}

export function shortenAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address
}

export async function groupWallets(wallets: AirGapWallet[]): Promise<AirGapWalletsGrouped> {
  const mapped: [ProtocolSymbols, [string, AirGapWallet]][] = await Promise.all(wallets.map(async (wallet: AirGapWallet) => {
    return [await wallet.protocol.getIdentifier(), [wallet.publicKey, wallet]] as [ProtocolSymbols, [string, AirGapWallet]]
  }))

  return mapped.reduce((obj: AirGapWalletsGrouped, next: [ProtocolSymbols, [string, AirGapWallet]]) => {
    return Object.assign(obj, { [next[0]]: { [next[1][0]]: next[1][1] } })
  }, {})
}
