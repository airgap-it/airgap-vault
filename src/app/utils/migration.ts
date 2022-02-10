import { AirGapWallet } from '@airgap/coinlib-core'

import { MnemonicSecret } from '../models/secret'

export function isSecretMigrated(secret: MnemonicSecret): boolean {
  return secret.fingerprint && secret.wallets.every(isWalletMigrated)
}

export function isWalletMigrated(wallet: AirGapWallet): boolean {
  return !!wallet.masterFingerprint
}
