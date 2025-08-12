import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { BIP32Factory, BIP32Interface } from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'
import { entropyToMnemonic, mnemonicToSeed } from 'bip39'

import { MnemonicSecret } from '../../models/secret'
import { isSecretMigrated, isWalletMigrated } from '../../utils/migration'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private readonly bip32 = BIP32Factory(ecc)
  constructor(private readonly secretsService: SecretsService, private readonly navigationService: NavigationService) {}

  public async runSecretsMigration(secrets: MnemonicSecret[]): Promise<void> {
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

  public filterMigratedSecrets(secrets: MnemonicSecret[]): [MnemonicSecret[], boolean] {
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

  public async deepFilterMigratedSecretsAndWallets(secrets: MnemonicSecret[]): Promise<[MnemonicSecret[], boolean]> {
    // the migration is a one-time event, after it's run on every secret, they will stabilize on this condition
    if (secrets.every(isSecretMigrated)) {
      return [secrets, true]
    }

    const migratedSecrets: (MnemonicSecret | undefined)[] = await Promise.all(
      secrets.map(async (secret: MnemonicSecret) => {
        if (!secret.fingerprint) {
          return undefined
        }

        const [migratedWallets]: [AirGapWallet[], boolean] = this.filterMigratedWallets(secret.wallets)
        if (migratedWallets.length === 0) {
          return undefined
        }

        const newSecret: MnemonicSecret = MnemonicSecret.init(secret)
        newSecret.wallets = migratedWallets

        return newSecret
      })
    )

    // create a new array of migrated secrets with filtered wallets
    return [migratedSecrets.filter((secret: MnemonicSecret | undefined) => secret !== undefined), false]
  }

  public async migrateSecret(secret: MnemonicSecret, options: { mnemonic?: string; persist?: boolean } = {}): Promise<void> {
    const defaultOptions = {
      persist: false
    }

    const resolvedOptions = {
      ...defaultOptions,
      ...options
    }

    if (secret.fingerprint === undefined) {
      let mnemonic: string | undefined = resolvedOptions.mnemonic
      if (mnemonic === undefined) {
        const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
        mnemonic = entropyToMnemonic(entropy)
      }

      const seed: Buffer = await mnemonicToSeed(mnemonic)
      const bip32Node: BIP32Interface = this.bip32.fromSeed(new Uint8Array(seed))
      const fingerprint: string = Buffer.from(bip32Node.fingerprint).toString('hex')

      secret.fingerprint = fingerprint
    }

    if (resolvedOptions.persist) {
      await this.secretsService.addOrUpdateSecret(secret, { setActive: false })
    }
  }

  public async migrateWallet(
    wallet: AirGapWallet,
    options: { mnemonic?: string; bip39Passphrase?: string; persist?: boolean }
  ): Promise<void> {
    const defaultOptions = {
      bip39Passphrase: '',
      persist: false
    }

    const resolvedOptions = {
      ...defaultOptions,
      ...options
    }

    if (wallet.masterFingerprint && !resolvedOptions.persist) {
      return
    }

    let mnemonic: string | undefined = resolvedOptions.mnemonic
    let secret: MnemonicSecret | undefined
    if (mnemonic === undefined || resolvedOptions.persist) {
      secret = this.secretsService.findByPublicKey(wallet.publicKey)
    }

    if (mnemonic === undefined && secret !== undefined) {
      const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
      mnemonic = entropyToMnemonic(entropy)
    } else if (mnemonic === undefined) {
      return
    }

    const publicKey: string = await wallet.protocol.getPublicKeyFromMnemonic(
      mnemonic,
      wallet.derivationPath,
      resolvedOptions.bip39Passphrase
    )

    if (publicKey !== wallet.publicKey) {
      throw new Error('Invalid BIP-39 Passphrase')
    }

    const seed: Buffer = await mnemonicToSeed(mnemonic, resolvedOptions.bip39Passphrase)
    const bip32Node: BIP32Interface = this.bip32.fromSeed(new Uint8Array(seed))
    const fingerprint: string = Buffer.from(bip32Node.fingerprint).toString('hex')

    wallet.masterFingerprint = fingerprint
    wallet.status = AirGapWalletStatus.ACTIVE

    if (resolvedOptions.persist && secret !== undefined) {
      await this.migrateSecret(secret, { mnemonic: resolvedOptions.mnemonic, persist: resolvedOptions.persist })
    }
  }
}
