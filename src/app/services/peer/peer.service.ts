import { generateGUID } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import * as sodium from 'libsodium-wrappers'

import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

/**
 * Convert a value to hex
 */
export function toHex(value: string | Buffer | Uint8Array): string {
  return Buffer.from(value).toString('hex')
}

/**
 * Convert a value from hex
 */
export function fromHex(value: string): Buffer | Uint8Array {
  return Buffer.from(value, 'hex')
}

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  public keyPair: Promise<sodium.KeyPair>

  constructor(private readonly storageService: VaultStorageService) {
    this.loadOrCreateSecret().catch(console.error)
  }

  public async init(): Promise<void> {
    // To make sure the service is started
  }

  public async sign(payload: string): Promise<{ signature: string; publicKey: string }> {
    const hash: Uint8Array = sodium.crypto_generichash(32, sodium.from_string(payload))
    const rawSignature: Uint8Array = sodium.crypto_sign_detached(hash, (await this.keyPair).privateKey)

    return { signature: toHex(rawSignature), publicKey: (await this.keyPair).publicKey }
  }

  public async verify(payload: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer | Uint8Array = new Uint8Array(fromHex(signature))

    const hash: Uint8Array = sodium.crypto_generichash(32, sodium.from_string(payload))

    const isValidSignature: boolean = sodium.crypto_sign_verify_detached(rawSignature, hash, new Uint8Array(Buffer.from(publicKey, 'hex')))

    return isValidSignature
  }

  /**
   * This method tries to load the seed from storage, if it doesn't exist, a new one will be created and persisted.
   */
  private async loadOrCreateSecret(): Promise<void> {
    const storageValue: unknown = await this.storageService.get(VaultStorageKey.INTERNAL_KEYPAIR_SEED)
    if (storageValue && typeof storageValue === 'string') {
      this.keyPair = await this.getKeypairFromSeed(storageValue)
    } else {
      const key: string = generateGUID()
      await this.storageService.set(VaultStorageKey.INTERNAL_KEYPAIR_SEED, key)
      this.keyPair = await this.getKeypairFromSeed(key)
    }
  }

  // tslint:disable-next-line: prefer-function-over-method
  private async getKeypairFromSeed(seed: string): Promise<sodium.KeyPair> {
    await sodium.ready

    return sodium.crypto_sign_seed_keypair(sodium.crypto_generichash(32, sodium.from_string(seed)))
  }
}
