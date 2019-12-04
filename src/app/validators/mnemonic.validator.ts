import { FormControl } from '@angular/forms'
import * as bip39 from 'bip39'

import { BIP39Signer } from '../models/BIP39Signer'

export class MnemonicValidator {
  public static checkMnemonic(mnemonic: string, wordlist: string): void {
    const words: string[] = BIP39Signer.prepareMnemonic(mnemonic).split(' ')

    if (words.length % 3 !== 0) {
      throw new Error('invalid mnemonic')
    }

    words.forEach((word: string) => {
      const index: number = wordlist.indexOf(word)
      if (index === -1) {
        throw new Error('invalid mnemonic')
      }
    })
  }

  public static isValidShare(control: FormControl): { [key: string]: boolean } | null {
    try {
      MnemonicValidator.checkMnemonic(control.value, bip39.wordlists.EN as any) // TODO: Fix typing (check what it actually is)
    } catch (e) {
      return {
        'not a social mnemonic share': true
      }
    }

    return null
  }

  public static isValid(control: FormControl): { [key: string]: boolean } | null {
    if (control.value && BIP39Signer.validateMnemonic(control.value)) {
      return null
    }

    return {
      'not a mnemonic': true
    }
  }
}
