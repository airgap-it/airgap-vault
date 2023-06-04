import { ClipboardService } from '@airgap/angular-core'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'

import * as bip39 from 'bip39'
import { Observable, Subscription } from 'rxjs'
import { WordlistPage } from 'src/app/pages/wordlist/wordlist.page'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { KeyboardPopoverComponent } from '../keyboard-popover/keyboard-popover.component'

function shuffle(arr: string): string {
  const array = arr.split('')
  let currentIndex = array.length
  let randomIndex

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array.join('')
}

const ALPHABET = 'qwertyuiopasdfghjklzxcvbnm'

@Component({
  selector: 'airgap-mnemonic-keyboard',
  templateUrl: './mnemonic-keyboard.component.html',
  styleUrls: ['./mnemonic-keyboard.component.scss']
})
export class MnemonicKeyboardComponent implements OnInit, OnDestroy {
  public text: string = ''

  @Input()
  public setWord: Observable<string>

  @Input()
  public enabled: boolean = true

  @Input()
  public wordlist: string[] = bip39.wordlists.EN

  @Output()
  public wordSelected: EventEmitter<string | undefined> = new EventEmitter()

  @Output()
  public pasted: EventEmitter<string | undefined> = new EventEmitter()

  @Output()
  public addNewWord: EventEmitter<void> = new EventEmitter()

  _maskInput: boolean = false

  @Output()
  public maskInput: EventEmitter<boolean> = new EventEmitter()

  public suggestions: string[] = []

  public hiddenSuggestions: number = 0

  public rows: { letter: string; enabled: boolean; active: boolean }[][]

  public validLetters: string = ALPHABET

  public shuffled: boolean = false

  private subscriptions: Subscription = new Subscription()

  constructor(
    private readonly clipboardService: ClipboardService,
    private readonly modalController: ModalController,
    private readonly popoverCtrl: PopoverController
  ) {
    this.paintKeyboard()
  }

  ngOnInit() {
    if (this.setWord) {
      this.subscriptions.add(
        this.setWord.subscribe((word) => {
          this.setText(word)
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }

  public async paintKeyboard() {
    if (this.wordlist) {
      const filtered = this.wordlist.filter((word) => word.startsWith(this.text))

      const numberOfSuggestions = 20
      this.suggestions = filtered.slice(0, numberOfSuggestions)
      this.hiddenSuggestions = Math.max(0, filtered.length - numberOfSuggestions)

      const set = new Set<string>()
      filtered.forEach((word) => {
        set.add(word[this.text.length])
      })
      this.validLetters = [...set.values()].join('')
    } else {
      this.validLetters = ALPHABET
    }

    let alphabet = ALPHABET

    const letters = (this.shuffled ? shuffle(alphabet) : alphabet).split('').map((letter) => {
      return { letter, enabled: this.validLetters.includes(letter), active: false }
    })
    const firstRow = 10
    const secondRow = 9
    const thirdRow = 7
    this.rows = []
    this.rows.push(letters.splice(0, firstRow))
    this.rows.push(letters.splice(0, secondRow))
    this.rows.push([...letters.splice(0, thirdRow), { letter: '{backspace}', enabled: this.text.length > 0, active: false }])
  }

  public selectLetter(letter: string) {
    if (letter === '{backspace}') {
      this.removeLetter()
    } else {
      this.addLetter(letter)
    }

    this.paintKeyboard()
  }

  public selectWord(word: string) {
    this.wordSelected.next(word)
  }

  private addLetter(char: string) {
    this.text += char

    const startsWith = this.wordlist.filter((word) => word.startsWith(this.text))

    // If there are multiple matches, we don't autocomplete.
    if (startsWith.length > 1) {
      return
    }

    // If there is only one word that matches, we will autocomplete.
    const hasExactMatch = startsWith.filter((word) => word === this.text).length > 0

    if (hasExactMatch) {
      this.selectWord(this.text)
    }
  }

  async removeLetter(): Promise<void> {
    const len = this.text.length
    this.text = this.text.substring(0, len - 1)
  }

  async toggleShuffled() {
    this.shuffled = !this.shuffled
    this.paintKeyboard()
  }

  async add() {
    this.addNewWord.next()
  }

  async delete() {
    this.wordSelected.next(undefined)
  }

  async setText(text: string) {
    this.text = text
    this.suggestions = []
    this.paintKeyboard()
  }

  async paste() {
    const text = await this.clipboardService.paste()

    this.pasted.emit(text)
  }

  async scramble() {
    this._maskInput = !this._maskInput
    this.maskInput.emit(this._maskInput)
  }

  async showWordlist() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: WordlistPage,
      componentProps: { isModal: true }
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async presentPopover(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: KeyboardPopoverComponent,
      componentProps: {
        onClick: (): void => {
          popover.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        },
        onAdd: (): void => {
          this.add()
        },
        onDelete: (): void => {
          this.delete()
        },
        onScramble: (): void => {
          this.scramble()
        },
        onShowWordlist: (): void => {
          this.showWordlist()
        },
        onToggleShuffled: (): void => {
          this.toggleShuffled()
        },
        maskWords: this._maskInput
      },
      event,
      translucent: true
    })

    popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
