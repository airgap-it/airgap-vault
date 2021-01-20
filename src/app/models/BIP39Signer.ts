import * as bip39 from 'bip39'
import { Hasher, sha3_256 } from 'js-sha3'
import secretJS from 'secrets.js-grempe'

export class BIP39Signer {
  public readonly checkSumLength: number = 10

  private getOffsetMapping(share: string): { offset: number; seedOffset: number } {
    const shareWordCount: number = share.split(' ').length

    switch (shareWordCount) {
      case 48:
        return { offset: 99, seedOffset: 64 }
      case 36:
        return { offset: 67, seedOffset: 42 }
      case 24:
        return { offset: 67, seedOffset: 32 }
      default:
        throw new Error('Currently only recovery of secrets with 48, 36 or 24 words are supported')
    }
  }

  private getRandomIntInclusive(min: number, max: number): number {
    const randomBuffer: Uint32Array = new Uint32Array(1)
    window.crypto.getRandomValues(randomBuffer)
    const randomNumber: number = randomBuffer[0] / (0xffffffff + 1)
    const ceilMin: number = Math.ceil(min)
    const floorMax: number = Math.floor(max)

    return Math.floor(randomNumber * (floorMax - ceilMin + 1)) + ceilMin
  }

  public entropyToMnemonic(entropy: string): string {
    return bip39.entropyToMnemonic(entropy)
  }

  public mnemonicToEntropy(mnemonic: string): string {
    const usedList: string[] | undefined = BIP39Signer.determineWordList(mnemonic)

    if (!usedList) {
      throw Error('non-compatible mnemonic')
    }

    return bip39.mnemonicToEntropy(mnemonic, usedList)
  }

  public static prepareMnemonic(mnemonic: string): string {
    return mnemonic.trim().toLowerCase()
  }

  public static validateMnemonic(mnemonic: string): boolean {
    const preparedMnemonic: string = BIP39Signer.prepareMnemonic(mnemonic)
    const wordList: string[] | undefined = BIP39Signer.determineWordList(preparedMnemonic)

    return bip39.validateMnemonic(preparedMnemonic, wordList)
  }

  public static determineWordList(mnemonic: string): string[] | undefined {
    for (const list of BIP39Signer.wordLists()) {
      if (bip39.validateMnemonic(BIP39Signer.prepareMnemonic(mnemonic), list)) {
        return list
      }
    }

    return undefined
  }

  public static wordLists(): string[][] {
    return [
      bip39.wordlists.english
      /*
            bip39.wordlists.chinese_simplified,
            bip39.wordlists.chinese_traditional,
            bip39.wordlists.french,
            bip39.wordlists.italian,
            bip39.wordlists.japanese,
            bip39.wordlists.korean,
            bip39.wordlists.spanish
            */
    ]
  }

  public getUnknownWords(mnemonic: string): { word: string; position: number }[] {
    const split = mnemonic
      .toLowerCase()
      .split(' ')
      .filter((split) => split.length !== 0)
    const words = split // .slice(0, split.length - 1)

    const wordlist = bip39.wordlists.english

    const unknownWords: { word: string; position: number }[] = []

    words.forEach((word, index) => {
      if (!wordlist.includes(word)) {
        unknownWords.push({ word, position: index })
      }
    })

    return unknownWords
  }

  public generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[] {
    if (threshold > numberOfShares) {
      throw new Error('The threshold needs to be smaller or equal to the number or shares')
    } else if (numberOfShares < 2) {
      throw new Error('At least two shares are needed')
    }
    const secretDigester: Hasher = sha3_256.create()

    // TODO check if mnemoinc or secret
    const seed: string = bip39.mnemonicToEntropy(secret)
    secretDigester.update(seed)

    const shares = secretJS.share(seed + secretDigester.hex().slice(0, this.checkSumLength), numberOfShares, threshold)
    const calculatedShares: string[] = []
    for (let i = 0; i < shares.length; i++) {
      const paddedShare = shares[i].concat(
        Array(29)
          .fill(0)
          .map(() => this.getRandomIntInclusive(0, 9))
          .join('')
      )
      calculatedShares[i] = `${bip39.entropyToMnemonic(paddedShare.slice(0, 64))} ${bip39.entropyToMnemonic(paddedShare.slice(64, 128))}`
    }

    return calculatedShares
  }

  public recoverKey(shares: any): string {
    const offset = this.getOffsetMapping(shares[0])
    const translatedShares: string[] = []
    for (let i = 0; i < shares.length; i++) {
      const words = shares[i].split(' ')
      const firstHalf = words.slice(0, 24)
      const secondHalf = words.slice(24, words.length)
      translatedShares[i] = `${bip39.mnemonicToEntropy(firstHalf.join(' '))}${bip39.mnemonicToEntropy(secondHalf.join(' '))}`.substr(
        0,
        offset.offset
      )
    }
    const secretDigester = sha3_256.create()
    const combine = secretJS.combine(translatedShares)
    const seed = combine.slice(0, -this.checkSumLength)

    secretDigester.update(seed)

    const checksum = secretDigester.hex().slice(0, this.checkSumLength)
    const checksum2 = combine.substr(-this.checkSumLength)
    if (checksum !== checksum2) {
      throw new Error(
        'Checksum error, either the passed shares were generated for different secrets or the amount of shares is below the threshold'
      )
    }

    return bip39.entropyToMnemonic(seed)
  }
}
