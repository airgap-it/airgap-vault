import { FormControl } from '@angular/forms'
import * as bip39 from 'bip39'
import { BIP39Signer } from '../models/BIP39Signer'

export class MnemonicValidator {
  static checkMnemonic(mnemonic, wordlist) {
    const words = BIP39Signer.prepareMnemonic(mnemonic).split(' ')

    if (words.length % 3 !== 0) throw new Error('invalid mnemonic')

    words.map(word => {
      const index = wordlist.indexOf(word)
      if (index === -1) throw new Error('invalid mnemonic')
    })
  }

  static isValidShare(control: FormControl): any {
    try {
      MnemonicValidator.checkMnemonic(control.value, bip39.wordlists.EN)
    } catch (e) {
      return {
        'not a social mnemonic share': true
      }
    }

    return null
  }

  static isValid(control: FormControl): any {
    if (control.value && BIP39Signer.validateMnemonic(control.value)) {
      return null
    }

    return {
      'not a mnemonic': true
    }
  }
}
