import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import * as bip39 from 'bip39'

const levenshteinDistance = (str1: string = '', str2: string = '') => {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  return track[str2.length][str1.length]
}

interface Word {
  word: string
  index: number
  binary: string
}

@Component({
  selector: 'airgap-wordlist',
  templateUrl: './wordlist.page.html',
  styleUrls: ['./wordlist.page.scss']
})
export class WordlistPage implements OnInit {
  public wordlist: Word[]
  public filteredWordlist: Word[] = []
  public similarWords: Word[] = []

  public partialMatch: boolean = false

  public isModal: boolean = false

  constructor(private readonly modalController: ModalController) {
    this.wordlist = bip39.wordlists.english.map((word, index) => ({
      word,
      index,
      binary: index.toString(2).padStart(11, '0')
    }))
  }

  async ngOnInit() {
    this.filterItemsByString()
  }

  ngOnChanges() {
    this.filterItemsByString()
  }

  filterItems(event: any): void {
    function isValidSymbol(data: unknown): data is string {
      return data && typeof data === 'string' && data !== ''
    }

    const value: unknown = event.target.value

    const searchTerm = isValidSymbol(value) ? value.trim().toLowerCase() : undefined

    this.filterItemsByString(searchTerm)
  }

  private filterItemsByString(searchTerm?: string) {
    this.partialMatch = false
    if (searchTerm) {
      // If "numberSearchTerm" is a number, match index or binary representation
      const numberSearchTerm = Number(searchTerm)
      if (typeof numberSearchTerm !== undefined && !isNaN(numberSearchTerm)) {
        this.filteredWordlist = this.wordlist.filter((item) => item.index === numberSearchTerm || item.binary.startsWith(searchTerm))
      } else {
        // Prioritize words that start with the search term
        this.filteredWordlist = this.wordlist.filter((item) => item.word.startsWith(searchTerm))

        // Append words that have the search term somewhere besides the start
        const words = this.wordlist.filter((item) => item.word.includes(searchTerm) && !this.filteredWordlist.includes(item))
        words.forEach((w) => this.filteredWordlist.push(w))

        // Use levenshtein distance to find similar words
        this.similarWords = this.wordlist.filter((item) => levenshteinDistance(item.word, searchTerm) <= 2)
      }
    } else {
      this.filteredWordlist = this.wordlist
    }
  }

  close() {
    this.modalController.dismiss()
  }
}
