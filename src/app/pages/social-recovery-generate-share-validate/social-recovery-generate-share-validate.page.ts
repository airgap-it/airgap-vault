import { Component, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IonContent } from '@ionic/angular'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-share-validate',
  templateUrl: './social-recovery-generate-share-validate.page.html',
  styleUrls: ['./social-recovery-generate-share-validate.page.scss']
})
export class SocialRecoveryGenerateShareValidatePage {
  @ViewChild(IonContent) content: IonContent

  public validated: boolean = false
  public currentShare: number = 0
  public shares: string[]

  public isCompleted: boolean = false
  public currentWords: string[] = []
  public promptedWords: string[] = []
  public selectedWordIndex: number | null = null
  private secret: MnemonicSecret

  get currentShares(): string[] {
    if (this.shares && this.currentShare < this.shares.length) {
      const currentShares = this.shares[this.currentShare].split(' ')
      console.log('currentShares', currentShares)
      return currentShares
    } else return ['No shares generated, something went wrong']
  }

  constructor(private readonly navigationService: NavigationService, route: ActivatedRoute) {
    route.params.subscribe((_) => {
      this.currentShare = this.navigationService.getState().currentShare
      this.shares = this.navigationService.getState().shares
      this.secret = this.navigationService.getState().secret
    })
  }

  public onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  public onNext() {
    if (this.content) this.content.scrollToBottom(500)
  }

  prev() {
    this.navigationService
      .routeWithState('/social-recovery-generate-share-show', { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  next() {
    this.navigationService
      .routeWithState('/social-recovery-generate-share-show', {
        shares: this.shares,
        currentShare: this.currentShare + 1,
        secret: this.secret
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
