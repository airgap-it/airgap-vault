import { IACMessageDefinitionObject } from '@airgap/coinlib-core'
import { Component } from '@angular/core'

import { NavigationService } from '../../services/navigation/navigation.service'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

export enum QRType {
  V2 = 'V2',
  V3 = 'V3'
}

@Component({
  selector: 'airgap-account-share',
  templateUrl: './account-share.page.html',
  styleUrls: ['./account-share.page.scss']
})
export class AccountSharePage {
  public interactionUrl: IACMessageDefinitionObject
  public splits: string[] = []

  public qrType: QRType = QRType.V2

  public availableQRTypes = [QRType.V2, QRType.V3]

  constructor(private readonly navigationService: NavigationService) {
    this.interactionUrl = this.navigationService.getState().interactionUrl
    // this.splits = this.interactionUrl // .substr('airgap-wallet://?d='.length).split(',')
    console.log(this.interactionUrl)
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
