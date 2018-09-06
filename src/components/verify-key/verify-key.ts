import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

interface Word {
  word: string,
  originalIndex: number,
  selected: boolean,
  index?: number
}

@Component({
  selector: 'verify-key',
  templateUrl: 'verify-key.html'
})

export class VerifyKeyComponent implements OnInit {

  @Input()
  secret: string

  @Output()
  onCompleted = new EventEmitter<boolean>()

  private splittedSecret: Word[] = []
  private currentWords: Word[] = []
  private sortedWords: Word[] = []

  ngOnInit(): void {
    this.splittedSecret = this.secret.toLowerCase().split(' ').map((word, i) => {
      return {
        word: word,
        originalIndex: i,
        selected: false
      }
    })

    this.sortedWords = this.sortSecretAlphabetically(this.splittedSecret)

    for (let i = 0; i < this.sortedWords.length; i++) {
      this.sortedWords[i].index = i
    }

    this.reset()
  }

  sortSecretAlphabetically(secret: Word[]): Word[] {
    return secret.sort((a: Word, b: Word) => {
      return a.word >= b.word ? 1 : -1
    })
  }

  useWord(word) {
    this.currentWords.push(word)
    this.sortedWords[word.index].selected = true
    if (this.currentWords.length === this.sortedWords.length) {
      this.onCompleted.emit(this.isCorrect())
    }
  }

  removeWord(word) {
    for (let i = 0; i < this.currentWords.length; i++) {
      if (this.currentWords[i].word === word.word) this.currentWords.splice(i, 1)
    }
    this.sortedWords[word.index].selected = false
  }

  reset() {
    this.currentWords = []
    for (let i = 0; i < this.sortedWords.length; i++) {
      this.sortedWords[i].selected = false
    }
  }

  isCorrect() {
    return this.currentWords.map(w => w.word).join(' ').trim() === this.secret.trim()
  }
}
