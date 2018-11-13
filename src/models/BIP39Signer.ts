import { Signer } from './signer'
import { sha3_256 } from 'js-sha3'
import bip39 from 'bip39'
import secretJS from 'secrets.js-grempe'

export class BIP39Signer implements Signer {
  readonly checkSumLength = 10

  private getOffsetMapping(share: string): any {
    const shareWordCount = share.split(' ').length
    if (shareWordCount === 48) {
      return { offset: 99, seedOffset: 64 }
    } else if (shareWordCount === 36) {
      return { offset: 67, seedOffset: 42 }
    } else if (shareWordCount === 24) {
      return { offset: 67, seedOffset: 32 }
    }
    throw new Error('Currently only recovery of secrets with 24, 18 or 12 words are supported')
  }

  private getRandomIntInclusive(min, max) {
    const randomBuffer = new Uint32Array(1)
    window.crypto.getRandomValues(randomBuffer)
    let randomNumber = randomBuffer[0] / (0xffffffff + 1)
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(randomNumber * (max - min + 1)) + min
  }

  entropyToMnemonic(entropy: string): string {
    return bip39.entropyToMnemonic(entropy)
  }

  mnemonicToEntropy(mnemonic: string): string {
    return bip39.mnemonicToEntropy(mnemonic)
  }

  generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[] {
    if (threshold > numberOfShares) {
      throw new Error('The threshold needs to be smaller or equal to the number or shares')
    } else if (numberOfShares < 2) {
      throw new Error('At least two shares are needed')
    }
    const secretDigester = sha3_256.create()

    // TODO check if mnemoinc or secret
    const seed = bip39.mnemonicToEntropy(secret)
    secretDigester.update(seed)

    const shares = secretJS.share(seed + secretDigester.hex().slice(0, this.checkSumLength), numberOfShares, threshold)
    const calculatedShares = []
    for (let i = 0; i < shares.length; i++) {
      let paddedShare = shares[i].concat(
        Array(29)
          .fill(0)
          .map(() => this.getRandomIntInclusive(0, 9))
          .join('')
      )
      calculatedShares[i] = bip39.entropyToMnemonic(paddedShare.slice(0, 64)) + ' ' + bip39.entropyToMnemonic(paddedShare.slice(64, 128))
    }
    return calculatedShares
  }

  recoverKey(shares: any): string {
    const offset = this.getOffsetMapping(shares[0])
    let translatedShares = []
    for (let i = 0; i < shares.length; i++) {
      let words = shares[i].split(' ')
      let firstHalf = words.slice(0, 24)
      let secondHalf = words.slice(24, words.length)
      translatedShares[i] = (bip39.mnemonicToEntropy(firstHalf.join(' ')) + bip39.mnemonicToEntropy(secondHalf.join(' '))).substr(
        0,
        offset.offset
      )
    }
    const secretDigester = sha3_256.create()
    const combine = secretJS.combine(translatedShares)
    const seed = combine.slice(0, -this.checkSumLength)

    secretDigester.update(seed)

    let checksum = secretDigester.hex().slice(0, this.checkSumLength)
    let checksum2 = combine.substr(-this.checkSumLength)
    if (checksum !== checksum2) {
      throw new Error(
        'Checksum error, either the passed shares were generated for different secrets or the amount of shares is below the threshold'
      )
    }
    return bip39.entropyToMnemonic(seed)
  }
}
