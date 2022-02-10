import { Injectable } from '@angular/core'
import { toHexString } from 'src/app/utils/utils'

function binaryToByte(bin: string): number {
  return parseInt(bin, 2)
}

@Injectable({
  providedIn: 'root'
})
export class CoinFlipService {
  constructor() {}

  async validateInput(binaryEntropy: string): Promise<boolean> {
    if (typeof binaryEntropy !== 'string') {
      throw Error('Input needs to be a string')
    }
    if (binaryEntropy.length !== 256) {
      throw Error('Input length needs to be exactly 256')
    }
    if (!binaryEntropy.split('').every((c) => '01'.includes(c))) {
      throw Error('Input can only contain "0" or "1"')
    }

    return true
  }

  async getEntropyFromInput(binaryEntropy: string): Promise<string> {
    if (!(await this.validateInput(binaryEntropy))) {
      throw new Error('Invalid Coin Flip')
    }

    const entropyBytes = binaryEntropy.match(/(.{1,8})/g).map(binaryToByte)

    const entropy = toHexString(new Uint8Array(entropyBytes))

    console.log('entropy', entropy)

    return entropy
  }
}
