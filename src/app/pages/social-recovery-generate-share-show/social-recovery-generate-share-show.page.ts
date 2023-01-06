import { Component } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-share-show',
  templateUrl: './social-recovery-generate-share-show.page.html',
  styleUrls: ['./social-recovery-generate-share-show.page.scss']
})
export class SocialRecoveryGenerateShareShowPage {
  public currentShare: number = 0
  public readonly shares: string[]

  get currentShares(): string[] {
    if (this.shares && this.currentShare < this.shares.length) {
      const currentShares = this.shares[this.currentShare].split(' ')
      console.log('currentShares', currentShares)
      return currentShares
    } else return ['No shares generated, something went wrong']
  }

  constructor(private readonly navigationService: NavigationService) {
    // this.currentShare = 2
    this.currentShare = this.navigationService.getState().currentShare
    this.shares = this.navigationService.getState().shares
    console.log('currentShare', this.currentShare)
    console.log('shares', this.shares)
  }

  prev() {}

  next() {
    this.currentShare++
  }
}
