import { Injectable } from '@angular/core'
import * as createHash from 'create-hash'

export enum DiceRollType {
  DEFAULT = 0, // Iancoleman, Cobo Vault
  COLDCARD = 1
}

@Injectable({
  providedIn: 'root'
})
export class DiceRollService {
  private readonly emptyEntropy = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

  constructor() {}

  async transformEntropy(diceEntropy: string, type: DiceRollType): Promise<string> {
    if (type === DiceRollType.COLDCARD) {
      return diceEntropy.replace(/6/g, '0')
    }
    return diceEntropy
  }

  async validateInput(diceEntropy: string): Promise<boolean> {
    if (typeof diceEntropy !== 'string') {
      throw Error('Input needs to be a string')
    }
    if (diceEntropy.length < 99) {
      throw Error('Input length needs to be longer than 99')
    }
    if (!diceEntropy.split('').every((c) => '123456'.includes(c))) {
      throw Error('Input can only contain "1", "2", "3", "4", "5" and "6"')
    }

    return true
  }

  async getEntropyFromInput(diceEntropy: string, type: DiceRollType = DiceRollType.DEFAULT): Promise<string> {
    if (!(await this.validateInput(diceEntropy))) {
      throw new Error('Invalid diceEntropy')
    }

    const transformedEntropy = await this.transformEntropy(diceEntropy, type)

    const hash: Uint8Array = createHash('sha256').update(transformedEntropy).digest()

    const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

    const entropy = toHexString(hash)

    if (entropy === this.emptyEntropy) {
      throw new Error('Warning! Input is emtpy')
    }

    return entropy
  }
}
