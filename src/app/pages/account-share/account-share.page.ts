import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { Component } from '@angular/core'

import { NavigationService } from '../../services/navigation/navigation.service'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: IACMessageDefinitionObjectV3[] = []
  public splits: string[] = []

  displayRawData: boolean = false

  constructor(private readonly navigationService: NavigationService) {
    this.interactionUrl = this.navigationService.getState().interactionUrl
  }

  public done(): void {
    this.navigationService.routeToSecretsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
