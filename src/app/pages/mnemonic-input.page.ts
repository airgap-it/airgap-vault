import { ElementRef } from '@angular/core'
import { AlertController } from '@ionic/angular'

import * as bip39 from 'bip39'
import { Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { BIPSigner } from '../models/BIP39Signer'

type SingleWord = string

/**
 * Common word-selection and accessible text-entry behavior for mnemonic pages.
 * Subclasses provide only the validation appropriate to their recovery flow.
 */
export abstract class MnemonicInputPage {
  public secretWords: string[] = []
  public secretWordsValid: Observable<boolean>
  public selectedWordIndex: number = 0
  public selectedWord: string = ''
  public maskWords: boolean = false
  public readonly wordList: SingleWord[] = bip39.wordlists.EN as SingleWord[]
  public lastWordOptions: string[] = []
  public readonly setWordEmitter: Subject<string> = new Subject()
  public keyboardEnabled: boolean = true
  public regularInputEnabled: boolean = false
  public seedphraseText: string = ''

  public abstract readonly secretContainer: ElementRef<HTMLElement>
  public abstract readonly seedphraseInput: ElementRef<HTMLTextAreaElement>

  protected constructor(public readonly maxWords: number, private readonly alertController: AlertController) {
    this.secretWordsValid = this.setWordEmitter.pipe(
      map(() => {
        const isShorterThanMaxLength = this.selectedWordIndex === -1 && this.secretWords.length < this.maxWords
        const isEditingWord = this.selectedWordIndex !== -1
        this.keyboardEnabled = isShorterThanMaxLength || isEditingWord

        return this.isValid()
      })
    )
  }

  public selectWord(index: number): void {
    this.selectedWordIndex = index
    this.selectedWord = this.secretWords[this.selectedWordIndex]
    this.notifySelectionChanged()
  }

  public wordLastSelected(word: string | undefined): void {
    if (this.secretWords.length !== this.maxWords - 1) {
      console.error('(wordLastSelected): secret word list is not', this.maxWords - 1, 'words long')
      return
    }

    this.selectedWordIndex = this.maxWords - 1
    this.wordSelected(word)
  }

  public wordSelected(word: string | undefined): void {
    if (word === undefined) {
      if (this.selectedWordIndex >= 0) {
        this.secretWords.splice(this.selectedWordIndex, 1)
        this.selectWord(Math.max(this.selectedWordIndex - 1, 0))
      } else {
        this.selectWord(this.secretWords.length - 1)
      }
      this.getLastWord()
      return
    }

    if (this.selectedWordIndex === -1) {
      this.secretWords.push(word)
    } else {
      this.secretWords[this.selectedWordIndex] = word
    }

    this.resetSelection()
    this.getLastWord()
    this.notifySelectionChanged()

    if (this.secretContainer) {
      this.secretContainer.nativeElement.scrollTop = this.secretContainer.nativeElement.scrollHeight
    }
  }

  public isValid(): boolean {
    return this.hasValidWordCount(this.secretWords) && this.isFlowValid(this.secretWords)
  }

  public hasValidWordCount(words: string[]): boolean {
    return words.length <= this.maxWords
  }

  public async paste(text: string | undefined): Promise<void> {
    if (text === undefined) {
      return
    }

    const words = this.wordsFromText(text)
    if (this.hasValidWordCount(words) && this.isFlowValid(words)) {
      this.secretWords = words
      this.resetSelection()
      this.notifySelectionChanged()
      return
    }

    const alert = await this.alertController.create({
      header: 'Invalid Mnemonic',
      message: 'The text in your clipboard is not a valid mnemonic.',
      backdropDismiss: false,
      buttons: [{ text: 'Ok' }]
    })
    await alert.present()
  }

  public enableTextInput(): void {
    this.regularInputEnabled = true
    this.seedphraseText = this.secretWords.join(' ')
    setTimeout(() => this.focusSeedphraseInput(), 0)
  }

  public seedphraseChanged(text: string): void {
    this.secretWords = this.wordsFromText(text)
    this.resetSelection()
    this.getLastWord()
    this.notifySelectionChanged()
  }

  public async addNewWord(): Promise<void> {
    if (!this.hasValidWordCount([...this.secretWords, ''])) {
      console.error('(addNewWord): secret word list too long')
      return
    }

    this.secretWords.splice(this.selectedWordIndex + 1, 0, '')
    this.selectedWordIndex++
    this.notifySelectionChanged()
  }

  public async mask(enabled: boolean): Promise<void> {
    this.maskWords = enabled
  }

  public getLastWord(): void {
    const options: string[] = []
    if (this.secretWords.length === this.maxWords - 1) {
      for (const word of bip39.wordlists.EN) {
        if (bip39.validateMnemonic([...this.secretWords, word].join(' '))) {
          options.push(word)
        }
      }
    }
    this.lastWordOptions = options
  }

  protected wordsFromText(text: string): string[] {
    const normalizedMnemonic = BIPSigner.prepareMnemonic(text)
    return normalizedMnemonic ? normalizedMnemonic.split(' ') : []
  }

  protected abstract isFlowValid(words: string[]): boolean

  private resetSelection(): void {
    this.selectedWordIndex = -1
    this.selectedWord = ''
  }

  private notifySelectionChanged(): void {
    this.setWordEmitter.next(this.selectedWord ?? '')
  }

  private focusSeedphraseInput(): void {
    if (this.seedphraseInput) {
      this.seedphraseInput.nativeElement.focus()
    }
  }
}
