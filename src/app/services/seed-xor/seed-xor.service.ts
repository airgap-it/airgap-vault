import { Injectable } from '@angular/core'
import * as bip39 from 'bip39'

function bitwiseXorHexString(hexStrings: string[]) {
  var result = ''
  for (let index = 0; index < hexStrings[0].length; index++) {
    let temp = parseInt(hexStrings[0].charAt(index), 16)
    for (let x = 1; x < hexStrings.length; x++) {
      temp = temp ^ parseInt(hexStrings[x].charAt(index), 16)
    }
    result += temp.toString(16).toUpperCase()
  }
  return result
}

@Injectable({
  providedIn: 'root'
})
export class SeedXorService {
  constructor() {}

  async split(_mnemonic: string, _numberOfSplits: 2 | 3 | 4 = 2): Promise<string[]> {
    return []
  }

  async combine(shares: string[]): Promise<string> {
    const entropies = shares.map((share) => bip39.mnemonicToEntropy(share))

    if (entropies.some((entropy) => entropy.length !== entropies[0].length)) {
      throw new Error('Not all mnemonics are the same length!')
    }

    return bip39.entropyToMnemonic(bitwiseXorHexString(entropies))
  }
}
