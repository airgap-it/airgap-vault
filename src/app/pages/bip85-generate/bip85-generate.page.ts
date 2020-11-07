import { Component } from '@angular/core'
import { Secret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-bip85-generate',
  templateUrl: './bip85-generate.page.html',
  styleUrls: ['./bip85-generate.page.scss']
})
export class Bip85GeneratePage {
  public secret: Secret

  public mnemonicLength: 12 | 18 | 24 = 24

  public index: number = 0

  constructor(private readonly navigationService: NavigationService) {
    if (this.navigationService.getState()) {
      this.secret = this.navigationService.getState().secret
      console.log(this.secret)
    }
  }

  generateChildSeed() {
    this.navigationService
      .routeWithState('/bip85-show', { secret: this.secret, mnemonicLength: this.mnemonicLength, index: this.index })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
