import { FormControl } from '@angular/forms'
import * as bip39 from 'bip39'

export class MnemonicValidator {

  static checkMnemonic(mnemonic, wordlist) {
    const words = mnemonic.trim().split(' ')

    if (words.length % 3 !== 0) throw new Error('invalid mnemonic')

    words.map(function (word) {
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
    if (control.value && !bip39.validateMnemonic(control.value.trim())) {
      return {
        'not a mnemonic': true
      }
    }

    return null
  }

}
