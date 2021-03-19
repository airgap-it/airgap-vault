import { AirGapWallet } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import { Secret } from '../../models/secret'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  constructor(private readonly secretsService: SecretsService) {}

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
