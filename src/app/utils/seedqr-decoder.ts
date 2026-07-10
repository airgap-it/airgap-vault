import * as bip39 from 'bip39'

export class SeedQRDecoder {
  public static decode(data: string): string[] | null {
    try {
      const cleaned = data.trim()

      // SeedQR numérico (48 ou 96 dígitos)
      if (/^\d+$/.test(cleaned)) {
        const words: string[] = []

        const count = cleaned.length / 4

        if (count !== 12 && count !== 24) {
          return null
        }

        for (let i = 0; i < count; i++) {
          const index = parseInt(cleaned.substr(i * 4, 4), 10)

          if (index < 0 || index >= bip39.wordlists.EN.length) {
            return null
          }

          words.push(bip39.wordlists.EN[index])
        }

        if (!bip39.validateMnemonic(words.join(' '))) {
          return null
        }

        return words
      }

      return null
    } catch {
      return null
    }
  }
}