import { Component, Input, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'airgap-wordlist',
  templateUrl: './wordlist.page.html',
  styleUrls: ['./wordlist.page.scss']
})
export class WordlistPage implements OnInit {
  @Input() wordlist: string[]

  unfilteredWordlist: string[] = []
  filteredWordlist: string[] = []
  startsWithWordlist: string[] = []

  constructor(private readonly modalController: ModalController) {}

  ngOnInit() {
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
    if (searchTerm) {
      this.unfilteredWordlist = []
      this.startsWithWordlist = this.wordlist.filter((word) => word.startsWith(searchTerm))
      // TODO: Use Levenshtein distance?
      this.filteredWordlist = this.wordlist.filter((word) => word.includes(searchTerm) && !this.startsWithWordlist.includes(word))
    } else {
      this.unfilteredWordlist = this.wordlist
      this.startsWithWordlist = []
      this.filteredWordlist = []
    }
  }

  close() {
    this.modalController.dismiss()
  }
}
