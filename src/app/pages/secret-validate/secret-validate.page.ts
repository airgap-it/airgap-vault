import { Component, ViewChild } from '@angular/core'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-validate',
  templateUrl: './secret-validate.page.html',
  styleUrls: ['./secret-validate.page.scss']
})
export class SecretValidatePage {
  @ViewChild('verify')
  public verify: VerifyKeyComponent

  public readonly secret: Secret

  private validated: boolean = false // TODO: Can this be removed?

  constructor(private readonly navigationService: NavigationService) {
    this.secret = this.navigationService.getState().secret
  }

  public onComplete(isCorrect: boolean): void {
    this.validated = isCorrect
  }

  public onContinue(): void {
    this.goToSecretEditPage()
  }

  public goToSecretEditPage(): void {
    this.navigationService
      .routeWithState('secret-edit', { secret: this.secret, isGenerating: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
