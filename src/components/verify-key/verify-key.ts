import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import * as bip39 from 'bip39'
import { sha3_256 } from 'js-sha3'
interface Word {
  word: string
}

const ADDITIONAL_WORDS = 2

@Component({
  selector: 'verify-key',
  templateUrl: 'verify-key.html'
})
export class VerifyKeyComponent implements OnInit {
  @Input()
  secret: string

  @Output()
  onContinue = new EventEmitter<boolean>()

  @Output()
  onComplete = new EventEmitter<boolean>()

  isCompleted: boolean = false

  splittedSecret: Word[] = []
  currentWords: Word[] = []
  promptedWords: Word[] = []

  selectedWord: number = null

  ngOnInit(): void {
    this.splittedSecret = this.secret
      .toLowerCase()
      .split(' ')
      .map((word, i) => {
        return {
          word: word
        }
      })
    this.reset()

    this.onComplete.subscribe(result => {
      this.isCompleted = result
    })
  }

  ngOnDestroy(): void {
    this.onComplete.unsubscribe()
  }

  continue() {
    this.onContinue.emit()
  }

  promptNextWord() {
    this.promptedWords.length = 0

    const correctWord = this.splittedSecret[this.emptySpot(this.currentWords)]

    this.promptedWords.push(correctWord)

    const wordList = bip39.wordlists.EN.slice()

    for (let i = 0; i < ADDITIONAL_WORDS; i++) {
      const filteredList = wordList.filter(word => !this.splittedSecret.find(w => w.word === word))

      let hashedWord = sha3_256(correctWord.word)
      for (let hashRuns = 0; hashRuns <= i; hashRuns++) {
        hashedWord = sha3_256(hashedWord)
      }

      const word: Word = {
        word: filteredList[this.stringToIntHash(hashedWord, 0, filteredList.length)]
      }

      this.promptedWords.push(word)
    }

    this.promptedWords = this.shuffle(this.promptedWords)
  }

  shuffle(a) {
    let counter = a.length

    while (counter > 0) {
      let index = Math.floor(Math.random() * counter)

      counter--

      let temp = a[counter]
      a[counter] = a[index]
      a[index] = temp
    }

    return a
  }

  stringToIntHash(str, lowerbound, upperbound) {
    let result = 0;

    for (let i = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;
  }

  isSelectedWord(word): boolean {
    if (this.selectedWord !== null) {
      return this.currentWords[this.selectedWord].word === word.word
    }
    return false
  }

  selectEmptySpot() {
    this.selectedWord = null
    this.promptNextWord()
  }

  useWord(word) {
    let index = this.emptySpot(this.currentWords)

    // unselect any selected words
    this.selectedWord = null
    this.currentWords[index] = word

    // prompt next word
    if (!this.isFull() && index < this.splittedSecret.length - 1) {
      return this.promptNextWord()
    }

    if (this.isFull()) {
      // if all words are placed, check for correctness, else next
      this.promptedWords = []
      this.onComplete.emit(this.isCorrect())
    }
  }

  emptySpot(array: Word[]): number {
    if (this.selectedWord !== null) {
      return this.selectedWord
    }
    return array.findIndex(obj => obj === null)
  }

  selectWord(index: number) {
    this.selectedWord = index
    this.promptNextWord()
  }

  reset() {
    this.selectedWord = null
    this.currentWords = Array(this.splittedSecret.length).fill(null)
    this.promptNextWord()
  }

  isFull() {
    return this.currentWords.filter(w => w !== null).length === this.splittedSecret.length
  }

  isCorrect() {
    return (
      this.currentWords
        .map(w => w ? w.word : '-')
        .join(' ')
        .trim() === this.secret.trim()
    )
  }
}
