import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { BIP39Signer } from '../../models/BIP39Signer'
import { SecretEditPage } from '../secret-edit/secret-edit'
import { Secret } from '../../models/secret'
import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { MnemonicValidator } from '../../validators/mnemonic.validator'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'
import Keyboard from 'simple-keyboard'
import autocorrect from 'simple-keyboard-autocorrect'
import bip39 from 'bip39'

const signer = new BIP39Signer()

@IonicPage()
@Component({
  selector: 'page-secret-import',
  templateUrl: 'secret-import.html'
})
export class SecretImportPage {
  keyboard: Keyboard
  suggestions: string[] = []

  readonly mnemonic: string
  secretImportForm: FormGroup

  constructor(public navController: NavController, private formBuilder: FormBuilder) {
    const formGroup = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    this.secretImportForm = this.formBuilder.group(formGroup)
  }

  goToSecretCreatePage() {
    const secret = new Secret(signer.mnemonicToEntropy(BIP39Signer.prepareMnemonic(this.mnemonic)))
    this.navController.push(SecretEditPage, { secret: secret, isGenerating: true }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  onChange = (input: string) => {
    this.secretImportForm.patchValue({ mnemonic: input })
    this.keyboard.setInput(input)
    console.log('Input changed', input)
  }

  onKeyPress = (button: string) => {
    console.log('Button pressed', button)

    /**
     * Get suggestions
     */
    let suggestions = this.getSuggestions()
    if (suggestions) {
      this.setSuggestionsBar(suggestions)
    } else {
      this.clearSuggestions()
    }

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === '{shift}') {
      this.handleShift()
    }
  }

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value)
  }

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName
    let shiftToggle = currentLayout === 'default' ? 'shift' : 'default'

    this.keyboard.setOptions({
      layoutName: shiftToggle
    })
  }

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button),
      mergeDisplay: true,
      layout: {
        default: ['q w e r t y u i o p', 'a s d f g h j k l', '{shift} z x c v b n m {backspace}', '{space}'],
        shift: ['Q W E R T Y U I O P', 'A S D F G H J K L', '{shift} Z X C V B N M {backspace}', '{space}']
      },
      display: {
        '{import}': 'Import',
        '{escape}': 'esc ⎋',
        '{backspace}': '⌫',
        '{shift}': '⇧'
      },
      autocorrectDict: bip39.wordlists.english,
      modules: [autocorrect]
    } as any)
  }

  getSuggestions() {
    let input = this.keyboard.getInput()
    let inputWords = input.split(' ')
    let lastWord = inputWords[inputWords.length - 1]
    let suggestions = (this.keyboard as any).modules.autocorrect.get(lastWord)
    if (suggestions) {
      suggestions.splice(4)
    }
    return suggestions
  }

  setSuggestionsBar(suggestions) {
    this.suggestions = suggestions.map(suggestion => suggestion[1])
  }

  clearSuggestions() {
    this.suggestions = []
  }

  applySuggestion(suggestion) {
    let input = this.keyboard.getInput()
    let inputWords = input.split(' ')
    let lastWord = inputWords[inputWords.length - 1]
    inputWords[inputWords.length - 1] = suggestion
    let newInput = inputWords.join(' ')
    this.keyboard.setInput(newInput)
    this.secretImportForm.patchValue({ mnemonic: `${newInput} ` })

    console.log((this.keyboard as any).caretPosition)

    if ((this.keyboard as any).caretPosition) {
      let caretPos = suggestion.length - lastWord.length
      let negativeCaretPos = caretPos > 0 ? false : true

      if (negativeCaretPos) {
        caretPos = Math.abs(caretPos)
      }

      console.log((this.keyboard as any).caretPosition, caretPos, negativeCaretPos)
      ;(this.keyboard as any).utilities.updateCaretPos(caretPos, negativeCaretPos)
    }

    console.log(suggestion)
    this.clearSuggestions()
  }
}
