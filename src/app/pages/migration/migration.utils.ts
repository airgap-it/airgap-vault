import { AirGapWallet } from '@airgap/coinlib-core'

import { Secret } from '../../models/secret'
import { isWalletMigrated } from '../../utils/migration'

import { GroupMigrationStatus, MigrationStatus, MigrationWallet } from './migration.types'

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
  secret: Secret,
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
