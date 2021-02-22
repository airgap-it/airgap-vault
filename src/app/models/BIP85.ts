import { BIP32Interface, fromBase58, fromSeed } from 'bip32';
import { validateMnemonic, entropyToMnemonic, mnemonicToSeed } from 'bip39';
import { BIP85Child } from './BIP85Child';

import * as createHmac from 'create-hmac';

export function checkValidIndex(index: number): boolean {
    return typeof index === 'number' && index >= 0;
}

// Copied from https://github.com/bitcoinjs/bip32/blob/master/ts-src/crypto.ts because it is not exported
export function hmacSHA512(key: Buffer, data: Buffer): Buffer {
    return createHmac('sha512', key).update(data).digest();
}

// https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki

/**
 * Constants defined in BIP-85
 */
const BIP85_KEY: string = 'bip-entropy-from-k';
const BIP85_DERIVATION_PATH: number = 83696968;
export enum BIP85_APPLICATIONS {
    BIP39 = 39,
    WIF = 2,
    XPRV = 32,
    HEX = 128169,
}

/**
 * BIP-85 helper types
 */
type BIP85_WORD_LENGTHS = 12 | 18 | 24;

type BIP39_LANGUAGES = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Derive BIP-39 child entropy from a BIP-32 root key
 */
export class BIP85 {
    private node: BIP32Interface;

    constructor(node: BIP32Interface) {
        this.node = node;
    }

    deriveBIP39(
        language: BIP39_LANGUAGES,
        words: BIP85_WORD_LENGTHS,
        index: number = 0,
    ): BIP85Child {
        if (!checkValidIndex(index)) {
            throw new Error('BIP39 invalid index');
        }

        if (typeof language !== 'number') {
            throw new Error('BIP39 invalid language type');
        }

        if (!(language >= 0 && language <= 8)) {
            throw new Error('BIP39 invalid language');
        }

        const entropyLength: 16 | 24 | 32 = ((): 16 | 24 | 32 => {
            switch (words) {
                case 12:
                    return 16;
                case 18:
                    return 24;
                case 24:
                    return 32;

                default:
                    throw new Error('BIP39 invalid mnemonic length');
            }
        })();

        const entropy = this.derive(
            `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.BIP39}'/${language}'/${words}'/${index}'`,
            entropyLength,
        );

        return new BIP85Child(entropy, BIP85_APPLICATIONS.BIP39);
    }

    deriveWIF(index: number = 0): BIP85Child {
        if (!checkValidIndex(index)) {
            throw new Error('WIF invalid index');
        }

        const entropy = this.derive(
            `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.WIF}'/${index}'`,
            32,
        );

        return new BIP85Child(entropy, BIP85_APPLICATIONS.WIF);
    }

    deriveXPRV(index: number = 0): BIP85Child {
        if (!checkValidIndex(index)) {
            throw new Error('XPRV invalid index');
        }

        const entropy = this.derive(
            `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.XPRV}'/${index}'`,
            64,
        );

        return new BIP85Child(entropy, BIP85_APPLICATIONS.XPRV);
    }

    deriveHex(numBytes: number, index: number = 0): BIP85Child {
        if (!checkValidIndex(index)) {
            throw new Error('HEX invalid index');
        }

        if (typeof numBytes !== 'number') {
            throw new Error('HEX invalid byte length type');
        }

        if (numBytes < 16 || numBytes > 64) {
            throw new Error('HEX invalid byte length');
        }

        const entropy = this.derive(
            `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.HEX}'/${numBytes}'/${index}'`,
            numBytes,
        );

        return new BIP85Child(entropy, BIP85_APPLICATIONS.HEX);
    }

    derive(path: string, bytesLength: number = 64): string {
        const childNode: BIP32Interface = this.node.derivePath(path);
        const childPrivateKey: Buffer = childNode.privateKey!; // Child derived from root key always has private key

        const hash: Buffer = hmacSHA512(Buffer.from(BIP85_KEY), childPrivateKey);
        const truncatedHash: Buffer = hash.slice(0, bytesLength);

        const childEntropy: string = truncatedHash.toString('hex');

        return childEntropy;
    }

    static fromBase58(bip32seed: string): BIP85 {
        const node: BIP32Interface = fromBase58(bip32seed);
        if (node.depth !== 0) {
            throw new Error('Expected master, got child');
        }

        return new BIP85(node);
    }

    static fromSeed(bip32seed: Buffer): BIP85 {
        const node: BIP32Interface = fromSeed(bip32seed);
        if (node.depth !== 0) {
            throw new Error('Expected master, got child');
        }

        return new BIP85(node);
    }

    static fromEntropy(entropy: string, password: string = ''): BIP85 {
        const mnemonic = entropyToMnemonic(entropy);

        return BIP85.fromMnemonic(mnemonic, password);
    }

    static fromMnemonic(mnemonic: string, password: string = ''): BIP85 {
        if (!validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic');
        }

        const seed = mnemonicToSeed(mnemonic, password);

        return BIP85.fromSeed(seed);
    }
}
