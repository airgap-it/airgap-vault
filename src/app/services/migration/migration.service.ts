import { AirGapWallet } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import { Secret } from '../../models/secret'
import { isSecretMigrated, isWalletMigrated } from '../../utils/migration'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  constructor(private readonly secretsService: SecretsService, private readonly navigationService: NavigationService) {}

  public async runSecretsMigration(secrets: Secret[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (secrets.every(isSecretMigrated)) {
        resolve()
      } else {
        this.navigateToMigrationPage({ secrets }).then(resolve).catch(reject)
      }
    })
  }

  public async runWalletsMigration(wallets: AirGapWallet[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (wallets.every(isWalletMigrated)) {
        resolve()
      } else {
        this.navigateToMigrationPage({ wallets }).then(resolve).catch(reject)
      }
    })
  }

  private async navigateToMigrationPage(navigationData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.navigationService
        .routeWithState('/migration', {
          ...navigationData,
          onSuccess: resolve,
          onError: reject
        })
        .catch((error) => {
          handleErrorLocal(ErrorCategory.IONIC_NAVIGATION)(error)
          reject(error)
        })
    })
  }

  public filterMigratedSecrets(secrets: Secret[]): [Secret[], boolean] {
    // the migration is a one-time event, after it's run on every secret, they will stabilize on this condition
    if (secrets.every(isSecretMigrated)) {
      return [secrets, true]
    }

    return [secrets.filter(isSecretMigrated), false]
  }

  public filterMigratedWallets(wallets: AirGapWallet[]): [AirGapWallet[], boolean] {
    // the migration is a one-time event, after it's run on every wallet, they will stabilize on this condition
    if (wallets.every(isWalletMigrated)) {
      return [wallets, true]
    }

    return [wallets.filter(isWalletMigrated), false]
  }

  public deepFilterMigratedSecretsAndWallets(secrets: Secret[]): [Secret[], boolean] {
    // the migration is a one-time event, after it's run on every secret, they will stabilize on this condition
    if (secrets.every(isSecretMigrated)) {
      return [secrets, true]
    }

    // create a new array of migrated secrets with filtered wallets
    return [
      secrets
        .map((secret: Secret) => {
          if (!secret.fingerprint) {
            return undefined
          }

          const [migratedWallets]: [AirGapWallet[], boolean] = this.filterMigratedWallets(secret.wallets)
          if (migratedWallets.length === 0) {
            return undefined
          }

          const newSecret: Secret = Secret.init(secret)
          newSecret.wallets = migratedWallets

          return newSecret
        })
        .filter((secret: Secret | undefined) => secret !== undefined),
      false
    ]
  }

  public async migrateSecret(secret: Secret): Promise<void> {
    if (secret.fingerprint === undefined) {
      const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
      const mnemonic: string = bip39.entropyToMnemonic(entropy)
      const seed: Buffer = await bip39.mnemonicToSeed(mnemonic)
      const bip: bip32.BIP32Interface = bip32.fromSeed(seed)
      const fingerprint: string = bip.fingerprint.toString('hex')

      secret.fingerprint = fingerprint
    }

    await this.secretsService.addOrUpdateSecret(secret, { setActive: false })
  }

  public async migrateWallet(wallet: AirGapWallet, bip39Passphrase: string = ''): Promise<void> {
    const secret: Secret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      return
    }

    if (wallet.masterFingerprint && secret.fingerprint) {
      return
    }

    if (!wallet.masterFingerprint) {
      const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
      const mnemonic: string = bip39.entropyToMnemonic(entropy)
      const publicKey: string = await wallet.protocol.getPublicKeyFromMnemonic(mnemonic, wallet.derivationPath, bip39Passphrase)

      if (publicKey !== wallet.publicKey) {
        throw new Error('Invalid BIP-39 Passphrase')
      }

      const seed: Buffer = await bip39.mnemonicToSeed(mnemonic, bip39Passphrase)
      const bip: bip32.BIP32Interface = bip32.fromSeed(seed)
      const fingerprint: string = bip.fingerprint.toString('hex')

      wallet.masterFingerprint = fingerprint
    }

    await this.migrateSecret(secret)
  }
}
