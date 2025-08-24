import { encode } from 'wif'
import { BIP32Factory } from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'
import { entropyToMnemonic } from 'bip39'
import { BIP85_APPLICATIONS } from './BIP85'

export class BIP85Child {
  private readonly bip32 = BIP32Factory(ecc)

  constructor(private readonly entropy: string, private readonly type: BIP85_APPLICATIONS) {}

  toEntropy(): string {
    if (this.type === BIP85_APPLICATIONS.XPRV) {
      return this.entropy.slice(64, 128)
    } else {
      return this.entropy
    }
  }

  toMnemonic(): string {
    if (this.type !== BIP85_APPLICATIONS.BIP39) {
      throw new Error('BIP85Child type is not BIP39')
    }

    return entropyToMnemonic(this.entropy)
  }

  toWIF(): string {
    if (this.type !== BIP85_APPLICATIONS.WIF) {
      throw new Error('BIP85Child type is not WIF')
    }

    const buf = Buffer.from(this.entropy, 'hex')

    return encode(128, buf, true)
  }

  toXPRV(): string {
    if (this.type !== BIP85_APPLICATIONS.XPRV) {
      throw new Error('BIP85Child type is not XPRV')
    }

    const chainCode = Buffer.from(this.entropy.slice(0, 64), 'hex')
    const privateKey = Buffer.from(this.entropy.slice(64, 128), 'hex')

    return this.bip32.fromPrivateKey(new Uint8Array(privateKey), new Uint8Array(chainCode)).toBase58()
  }
}
