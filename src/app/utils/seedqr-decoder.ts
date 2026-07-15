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


  public static decodeCompact(base64: string): string[] | null {
  try {
    const binary = atob(base64)

    let bytes = Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    )

    // ZXing - CompactSeedQR 12 palavras
    // 41 0? + 16 bytes + EC
    if (bytes.length === 19 && bytes[0] === 0x41) {
      bytes = bytes.slice(2, 18)
    }

    // ZXing - CompactSeedQR 24 palavras
    // 42 0? + 32 bytes
    else if (bytes.length === 34 && bytes[0] === 0x42) {
      bytes = bytes.slice(2)
    }

    // ZBar já entrega somente os bytes
    else if (bytes.length !== 16 && bytes.length !== 32) {
      return null
    }

    const entropyHex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
   
    const mnemonic = bip39.entropyToMnemonic(entropyHex)
   
    if (!bip39.validateMnemonic(mnemonic)) {
      return null
    }

    return mnemonic.split(' ')

  } catch {
    return null
  }
}
}