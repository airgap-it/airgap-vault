import { Component } from '@angular/core'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ActivatedRoute } from '@angular/router'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

@Component({
  selector: 'airgap-secret-rules',
  templateUrl: './secret-rules.page.html',
  styleUrls: ['./secret-rules.page.scss']
})
export class SecretRulesPage {
  private secret: Secret
  private secretID: string

  constructor(
    private readonly navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
    private secretService: SecretsService
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.secretID = params['secretID']
      this.secret = this.secretService.getSecretById(this.secretID)
    })
  }

  public goToShowSecret(): void {
    this.navigationService.route(`secret-show/${this.secret.id}`).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
