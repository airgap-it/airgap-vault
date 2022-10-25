import { Component } from '@angular/core'
import { AirGapWallet } from '@airgap/coinlib-core'
import { MessageSignResponse } from '@airgap/serializer'
import { TranslateService } from '@ngx-translate/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

enum TransactionQRType {
  SignedAirGap = 0,
  SignedRaw = 1
}

@Component({
  selector: 'airgap-transaction-signed',
  templateUrl: './transaction-signed.page.html',
  styleUrls: ['./transaction-signed.page.scss']
})
export class TransactionSignedPage {
  public signedTxs: string[]
  public interactionUrl: string

  public splits: string[]

  public pageTitle: string
  public heading: string
  public translationKey: string

  public messageSignResponse: MessageSignResponse
  public wallets: AirGapWallet[]
  public qrType: TransactionQRType = 0

  public signedTransactionSync: any // TODO: Types

  constructor(public navigationService: NavigationService, private readonly translateService: TranslateService) {
    this.interactionUrl = this.navigationService.getState().interactionUrl
    this.wallets = this.navigationService.getState().wallets
    this.signedTxs = this.navigationService.getState().signedTxs
    this.translationKey = this.navigationService.getState().translationKey
    this.pageTitle = this.translateService.instant(`${this.translationKey}.title`)
    this.heading = this.translateService.instant(`${this.translationKey}.heading`)
    this.messageSignResponse = this.navigationService.getState().messageSignResponse
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
