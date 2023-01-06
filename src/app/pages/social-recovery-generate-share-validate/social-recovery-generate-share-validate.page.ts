import { Component } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-share-validate',
  templateUrl: './social-recovery-generate-share-validate.page.html',
  styleUrls: ['./social-recovery-generate-share-validate.page.scss']
})
export class SocialRecoveryGenerateShareValidatePage {
  public validated: boolean = false
  public currentShare: number = 0
  public readonly shares: string[]

  public isCompleted: boolean = false
  public currentWords: string[] = []
  public promptedWords: string[] = []
  public selectedWordIndex: number | null = null

  get currentShares(): string[] {
    if (this.shares && this.currentShare < this.shares.length) {
      const currentShares = this.shares[this.currentShare].split(' ')
      console.log('currentShares', currentShares)
      return currentShares
    } else return ['No shares generated, something went wrong']
  }

  constructor(private readonly navigationService: NavigationService) {
    this.currentShare = this.navigationService.getState().currentShare
    this.shares = this.navigationService.getState().shares
    console.log('currentShare', this.currentShare)
    console.log('shares', this.shares)
  }

  public onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  public onContinue() {
    this.next.bind(this)()
  }

  prev() {}

  next() {
    this.navigationService
      .routeWithState('/social-recovery-generate-share-show', { shares: this.shares, currentShare: this.currentShare + 1 })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public isCorrect(): boolean {
    return (
      this.currentWords
        .map((word: string) => (word ? word : '-'))
        .join(' ')
        .trim() === this.shares[this.currentShare].trim()
    )
  }

  public isSelectedWord(word: string): boolean {
    if (this.selectedWordIndex !== null) {
      return this.currentWords[this.selectedWordIndex] === word
    }

    return false
  }

  public useWord(word: string): void {
    console.log('word', word)
  }
}
