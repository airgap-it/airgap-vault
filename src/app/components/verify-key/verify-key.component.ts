import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import * as bip39 from 'bip39'
import { sha3_256 } from 'js-sha3'

type SingleWord = string

const ADDITIONAL_WORDS: number = 2

@Component({
  selector: 'airgap-verify-key',
  templateUrl: './verify-key.component.html',
  styleUrls: ['./verify-key.component.scss']
})
export class VerifyKeyComponent implements OnInit {
  @Input()
  public secret: string

  @Output()
  public onContinue = new EventEmitter<boolean>()

  @Output()
  public onComplete = new EventEmitter<boolean>()

  public isCompleted: boolean = false

  public splittedSecret: SingleWord[] = []
  public currentWords: SingleWord[] = []
  public promptedWords: SingleWord[] = []

  public selectedWordIndex: number = null

  public ngOnInit(): void {
    this.splittedSecret = this.secret.toLowerCase().split(' ')

    this.reset()
  }

  public continue(): void {
    this.onContinue.emit()
  }

  public promptNextWord(): void {
    this.promptedWords = []

    const correctWord: SingleWord = this.splittedSecret[this.emptySpot(this.currentWords)]

    this.promptedWords.push(correctWord)

    const wordList: string[] = bip39.wordlists.EN

    for (let i: number = 0; i < ADDITIONAL_WORDS; i++) {
      const filteredList: string[] = wordList.filter(
        (originalWord: string) => !this.splittedSecret.find((word: SingleWord) => word === originalWord)
      )

      let hashedWord: string = sha3_256(correctWord)
      for (let hashRuns: number = 0; hashRuns <= i; hashRuns++) {
        hashedWord = sha3_256(hashedWord)
      }

      const additionalWord: SingleWord = filteredList[this.stringToIntHash(hashedWord, 0, filteredList.length)]

      this.promptedWords.push(additionalWord)
    }

    this.promptedWords = this.shuffle(this.promptedWords)
  }

  public shuffle(a: string[]): string[] {
    let counter: number = a.length

    while (counter > 0) {
      const index: number = Math.floor(Math.random() * counter)

      counter--

      const temp: string = a[counter]
      a[counter] = a[index]
      a[index] = temp
    }

    return a
  }

  public stringToIntHash(str: string, lowerbound: number, upperbound: number): number {
    let result: number = 0

    for (let i: number = 0; i < str.length; i++) {
      result = result + str.charCodeAt(i)
    }

    return (result % (upperbound - lowerbound)) + lowerbound
  }

  public isSelectedWord(word: SingleWord): boolean {
    if (this.selectedWordIndex !== null) {
      return this.currentWords[this.selectedWordIndex] === word
    }

    return false
  }

  public selectEmptySpot(): void {
    this.selectedWordIndex = null
    this.promptNextWord()
  }

  public useWord(word: SingleWord): void {
    const index: number = this.emptySpot(this.currentWords)

    // unselect any selected words
    this.selectedWordIndex = null
    this.currentWords[index] = word

    // prompt next word
    if (!this.isFull() && index < this.splittedSecret.length - 1) {
      this.promptNextWord()

      return
    }

    if (this.isFull()) {
      // if all words are placed, check for correctness, else next
      this.promptedWords = []
      this.setCompletedState(this.isCorrect())
    }
  }

  public setCompletedState(state: boolean) {
    this.isCompleted = state
    this.onComplete.emit(state)
  }

  public emptySpot(array: SingleWord[]): number {
    if (this.selectedWordIndex !== null) {
      return this.selectedWordIndex
    }

    return array.findIndex((word: SingleWord) => word === null)
  }

  public selectWord(index: number): void {
    this.selectedWordIndex = index
    this.promptNextWord()
  }

  public reset(): void {
    this.selectedWordIndex = null
    this.currentWords = Array(this.splittedSecret.length).fill(null)
    this.promptNextWord()
  }

  public isFull(): boolean {
    return this.currentWords.filter((word: string) => word !== null).length === this.splittedSecret.length
  }

  public isCorrect(): boolean {
    return (
      this.currentWords
        .map((word: SingleWord) => (word ? word : '-'))
        .join(' ')
        .trim() === this.secret.trim()
    )
  }
}
