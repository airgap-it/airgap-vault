import * as bip39 from 'bip39'

export class SeedQRDecoder {
  public static decode(data: string): string[] | null {
  try {
    const cleaned = data.trim()

    const numWords = cleaned.length / 4

    if (numWords !== 12 && numWords !== 24) {
      return null
    }

    const words: string[] = []

    for (let i = 0; i < numWords; i++) {
      const index = parseInt(
        cleaned.substring(i * 4, (i * 4) + 4),
        10
      )

      if (index < 0 || index >= bip39.wordlists.EN.length) {
        return null
      }

      words.push(bip39.wordlists.EN[index])
    }

    const mnemonic = words.join(' ')

    if (!bip39.validateMnemonic(mnemonic)) {
      return null
    }

    return words

  } catch {
    return null
  }
}
}