import * as bip39 from 'bip39'

export class SeedQrEncoder {
  /**
   * Gera o SeedQR padrão (Standard SeedQR)
   * Retorna uma string numérica compatível com SeedSigner.
   */
  public static encodeSeedQR(mnemonic: string): string {
    const words = mnemonic.trim().split(/\s+/)

    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Seed deve possuir 12 ou 24 palavras.')
    }

    return words
      .map((word) => {
        const index = bip39.wordlists.english.indexOf(word)

        if (index === -1) {
          throw new Error(`Palavra inválida: ${word}`)
        }

        return index.toString().padStart(4, '0')
      })
      .join('')
  }


  /**
   * Gera o CompactSeedQR
   * Retorna bytes binários compatíveis com SeedSigner CompactSeedQR.
   */
  public static encodeCompactSeedQR(mnemonic: string): Uint8Array {
    const words = mnemonic.trim().split(/\s+/)

    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Seed deve possuir 12 ou 24 palavras.')
    }

    let bits = ''

    for (const word of words) {
      const index = bip39.wordlists.english.indexOf(word)

      if (index === -1) {
        throw new Error(`Palavra inválida: ${word}`)
      }

      bits += index.toString(2).padStart(11, '0')
    }

    // Remove checksum BIP39
    const checksumBits = words.length === 12 ? 4 : 8

    bits = bits.substring(0, bits.length - checksumBits)

    const bytes = new Uint8Array(bits.length / 8)

    for (let i = 0; i < bytes.length; i++) {
   bytes[i] = Number.parseInt(bits.substring(i * 8, i * 8 + 8), 2);
   }
    return bytes
  }
}