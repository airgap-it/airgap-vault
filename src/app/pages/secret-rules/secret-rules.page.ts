import { Component } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'airgap-secret-rules',
  templateUrl: './secret-rules.page.html',
  styleUrls: ['./secret-rules.page.scss']
})
export class SecretRulesPage {
  public secretID: string

  constructor(private readonly navigationService: NavigationService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe((params) => {
      this.secretID = params['secretID']
    })
  }

  public goToShowSecret(): void {
    this.navigationService.route(`secret-show/${this.secretID}`).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
