import { ClipboardService } from '@airgap/angular-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { NavigationService } from '../../services/navigation/navigation.service'
import { airgapwallet, CompanionApp } from '../account-address/account-address.page'
import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: IACMessageDefinitionObjectV3[] = []
  public companionApp: CompanionApp
  public walletName: string
  public splits: string[] = []

  displayRawData: boolean = false

  constructor(private readonly navigationService: NavigationService, private readonly clipboardService: ClipboardService) {
    this.interactionUrl = this.navigationService.getState().interactionUrl
    this.companionApp = this.navigationService.getState().companionApp ?? airgapwallet
    this.walletName = this.companionApp.name
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public copyToClipboard(): void {
    this.clipboardService.copyAndShowToast(JSON.stringify(this.interactionUrl))
  }
}
