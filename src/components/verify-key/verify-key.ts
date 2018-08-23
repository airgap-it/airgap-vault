import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

/**
 * Generated class for the VerifyKeyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'verify-key',
  templateUrl: 'verify-key.html'
})

export class VerifyKeyComponent implements OnInit {

  @Input()
  secret: string

  @Output()
  onCompleted = new EventEmitter<boolean>()

  private splittedSecret = []
  private currentWords = []
  private sortedWords = []

  ngOnInit(): void {
    this.splittedSecret = this.secret.toLowerCase().split(' ').map((word, i) => {
      return {
        word: word,
        originalIndex: i,
        selected: false
      }
    })

    this.sortedWords = this.sortSecret(this.splittedSecret)

    for (let i = 0; i < this.sortedWords.length; i++) {
      this.sortedWords[i].index = i
    }

    this.reset()
  }

  sortSecret(secret: { word: string, originlIndex: number, selected: boolean }[]): { word: string, originlIndex: number, selected: boolean }[] {
    return secret.sort((a: { word: string, originlIndex: number, selected: boolean }, b: { word: string, originlIndex: number, selected: boolean }) => {
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
    for (let i = 0; i < this.currentWords.length; i++) {
      if (this.currentWords[i].originalIndex !== i) {
        return false
      }
    }
    return true
  }

}
