import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { BIPSigner } from '../../models/BIP39Signer'
import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

import * as bip39 from 'bip39'

type SingleWord = string

@Component({
  selector: 'airgap-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage {
  public mnemonic: string
  public secretImportForm: FormGroup

  public secretWords: SingleWord[] = []
  public promptedWords: SingleWord[] = []

  public readonly alphabets: SingleWord[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]

  selectedWordIndex: number = 0

  public wordBank: SingleWord[] = bip39.wordlists.EN as any

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly formBuilder: FormBuilder
  ) {
    const formGroup: {
      [key: string]: any
    } = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    this.secretImportForm = this.formBuilder.group(formGroup)
    this.secretImportForm.valueChanges.subscribe((formGroup) => {
      this.mnemonic = formGroup.mnemonic
    })

    for (var i = 0; i < 24; i++) {
      this.secretWords.push('')
    }

    this.promptedWords = this.alphabets
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-create' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public selectWord(word: SingleWord): void {
    if (this.selectedWordIndex > 23) return

    this.secretWords[this.selectedWordIndex] = word
    if (word.length === 1) {
      const temp = this.wordBank.filter((x) => x[0] === word)

      this.promptedWords = []

      temp.forEach((x) => {
        const y = x.substr(0, 2)
        if (this.promptedWords.indexOf(y) < 0) {
          this.promptedWords.push(y)
        }
      })

      if (this.promptedWords.length === 1) {
        word = this.promptedWords[0]
        const temp = this.wordBank.filter((x) => x.substr(0, 2) === word)

        this.promptedWords = temp
      }
    } else if (word.length === 2) {
      const temp = this.wordBank.filter((x) => x.substr(0, 2) === word)

      this.promptedWords = temp
    } else if (word.length > 2) {
      this.selectedWordIndex++
      this.promptedWords = this.alphabets
    } else {
      this.promptedWords = this.alphabets
    }
  }

  public undo(): void {
    if (this.selectedWordIndex > 23) {
      this.selectedWordIndex = 23
    }

    if (!this.secretWords[this.selectedWordIndex].length && this.selectedWordIndex > 0) {
      this.selectedWordIndex--
    }

    if (this.secretWords[this.selectedWordIndex].length > 2) {
      this.secretWords[this.selectedWordIndex] = this.secretWords[this.selectedWordIndex].substr(0, 2)
    } else if (this.secretWords[this.selectedWordIndex].length === 2) {
      this.secretWords[this.selectedWordIndex] = this.secretWords[this.selectedWordIndex][0]
    } else if (this.secretWords[this.selectedWordIndex].length === 1) {
      this.secretWords[this.selectedWordIndex] = ''
    }

    this.selectWord(this.secretWords[this.selectedWordIndex])
  }

  public isValid(): boolean {
    return BIPSigner.validateMnemonic(this.secretWords.join(' '))
  }

  public goToSecretCreatePage(): void {
    const signer: BIPSigner = new BIPSigner()

    const secret: Secret = new Secret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.secretWords.join(' '))))

    this.navigationService
      .routeWithState('secret-edit', { secret, isGenerating: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
