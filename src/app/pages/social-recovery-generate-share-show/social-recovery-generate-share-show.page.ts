import { Component } from '@angular/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-generate-share-show',
  templateUrl: './social-recovery-generate-share-show.page.html',
  styleUrls: ['./social-recovery-generate-share-show.page.scss']
})
export class SocialRecoveryGenerateShareShowPage {
  public currentShare: number = 0
  public readonly shares: string[]
  private readonly secret: MnemonicSecret

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
    this.secret = this.navigationService.getState().secret
    console.log('currentShare', this.currentShare)
    console.log('shares', this.shares)
    console.log('secret', this.secret)
  }

  prev() {}

  next() {
    this.navigationService
      .routeWithState('/social-recovery-generate-share-validate', {
        shares: this.shares,
        currentShare: this.currentShare,
        secret: this.secret
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
