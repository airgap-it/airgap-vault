import { BIP32Factory, BIP32Interface } from '@airgap/coinlib-core/dependencies/src/bip32-5.0.1/src/index'
import * as ecc from '@airgap/coinlib-core/dependencies/src/@bitcoinerlab/secp256k1-1.2.0/src/index'
import bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-4.0.0/src/index'
import { hmac } from '@airgap/coinlib-core/dependencies/src/@noble/hashes-1.8.0/src/hmac'
import { sha512 } from '@airgap/coinlib-core/dependencies/src/@noble/hashes-1.8.0/src/sha2'
import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39'

// BIP-85: Deterministic Entropy From BIP32 Keychains
// https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
//
// Replaces the `bip85` npm package, which pinned its own copies of bip32 2.x, bip39 3.0.2 (pbkdf2 path),
// tiny-secp256k1 and wif. This implementation uses the crypto primitives vendored in @airgap/coinlib-core.

const BIP85_KEY: Uint8Array = new TextEncoder().encode('bip-entropy-from-k')
const BIP85_DERIVATION_PATH: number = 83696968

const bip32 = BIP32Factory(ecc)

export enum BIP85_APPLICATIONS {
  BIP39 = 39,
  WIF = 2,
  XPRV = 32,
  HEX = 128169
}

export type BIP85_WORD_LENGTHS = 12 | 18 | 24
export type BIP39_LANGUAGES = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex')
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'))
}

function isValidIndex(index: number): boolean {
  return typeof index === 'number' && Number.isInteger(index) && index >= 0
}

export class BIP85Child {
  constructor(private readonly entropy: string, private readonly type: BIP85_APPLICATIONS) {}

  public toEntropy(): string {
    return this.type === BIP85_APPLICATIONS.XPRV ? this.entropy.slice(64, 128) : this.entropy
  }

  public toMnemonic(): string {
    if (this.type !== BIP85_APPLICATIONS.BIP39) {
      throw new Error('BIP85Child type is not BIP39')
    }

    return entropyToMnemonic(this.entropy)
  }

  public toWIF(): string {
    if (this.type !== BIP85_APPLICATIONS.WIF) {
      throw new Error('BIP85Child type is not WIF')
    }

    // mainnet (0x80) || 32-byte private key || 0x01 (compressed)
    const payload = new Uint8Array(34)
    payload[0] = 0x80
    payload.set(fromHex(this.entropy), 1)
    payload[33] = 0x01

    return bs58check.encode(payload)
  }

  public toXPRV(): string {
    if (this.type !== BIP85_APPLICATIONS.XPRV) {
      throw new Error('BIP85Child type is not XPRV')
    }

    const chainCode = fromHex(this.entropy.slice(0, 64))
    const privateKey = fromHex(this.entropy.slice(64, 128))

    return bip32.fromPrivateKey(privateKey, chainCode).toBase58()
  }
}

/**
 * Derive BIP-85 child entropy from a BIP-32 root key
 */
export class BIP85 {
  constructor(private readonly node: BIP32Interface) {}

  public deriveBIP39(language: BIP39_LANGUAGES, words: BIP85_WORD_LENGTHS, index: number = 0): BIP85Child {
    if (!isValidIndex(index)) {
      throw new Error('BIP39 invalid index')
    }
    if (typeof language !== 'number' || !(language >= 0 && language <= 8)) {
      throw new Error('BIP39 invalid language')
    }

    const entropyLength: number = (() => {
      switch (words) {
        case 12:
          return 16
        case 18:
          return 24
        case 24:
          return 32
        default:
          throw new Error('BIP39 invalid mnemonic length')
      }
    })()

    const entropy = this.derive(
      `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.BIP39}'/${language}'/${words}'/${index}'`,
      entropyLength
    )

    return new BIP85Child(entropy, BIP85_APPLICATIONS.BIP39)
  }

  public deriveWIF(index: number = 0): BIP85Child {
    if (!isValidIndex(index)) {
      throw new Error('WIF invalid index')
    }

    const entropy = this.derive(`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.WIF}'/${index}'`, 32)

    return new BIP85Child(entropy, BIP85_APPLICATIONS.WIF)
  }

  public deriveXPRV(index: number = 0): BIP85Child {
    if (!isValidIndex(index)) {
      throw new Error('XPRV invalid index')
    }

    const entropy = this.derive(`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.XPRV}'/${index}'`, 64)

    return new BIP85Child(entropy, BIP85_APPLICATIONS.XPRV)
  }

  public deriveHex(numBytes: number, index: number = 0): BIP85Child {
    if (!isValidIndex(index)) {
      throw new Error('HEX invalid index')
    }
    if (typeof numBytes !== 'number' || numBytes < 16 || numBytes > 64) {
      throw new Error('HEX invalid byte length')
    }

    const entropy = this.derive(`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.HEX}'/${numBytes}'/${index}'`, numBytes)

    return new BIP85Child(entropy, BIP85_APPLICATIONS.HEX)
  }

  /**
   * Derives the child at `path` and returns the first `bytesLength` bytes of
   * HMAC-SHA512(key = "bip-entropy-from-k", data = child private key) as hex.
   */
  public derive(path: string, bytesLength: number = 64): string {
    const childNode = this.node.derivePath(path)
    const childPrivateKey = childNode.privateKey
    if (childPrivateKey === undefined) {
      throw new Error('Expected private key on derived node')
    }

    const hash = hmac(sha512, BIP85_KEY, childPrivateKey)

    return toHex(hash.slice(0, bytesLength))
  }

  public static fromBase58(bip32seed: string): BIP85 {
    return BIP85.fromNode(bip32.fromBase58(bip32seed))
  }

  public static fromSeed(bip32seed: Uint8Array): BIP85 {
    return BIP85.fromNode(bip32.fromSeed(bip32seed))
  }

  public static fromEntropy(entropy: string, password: string = ''): BIP85 {
    return BIP85.fromMnemonic(entropyToMnemonic(entropy), password)
  }

  public static fromMnemonic(mnemonic: string, password: string = ''): BIP85 {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic')
    }

    return BIP85.fromSeed(new Uint8Array(mnemonicToSeedSync(mnemonic, password)))
  }

  private static fromNode(node: BIP32Interface): BIP85 {
    if (node.depth !== 0) {
      throw new Error('Expected master, got child')
    }

    return new BIP85(node)
  }
}
