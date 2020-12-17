import { Component } from '@angular/core'
import { AirGapWallet } from '@airgap/coinlib-core'

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

  public wallets: AirGapWallet[]
  public qrType: TransactionQRType = 0

  public signedTransactionSync: any // TODO: Types

  constructor(public navigationService: NavigationService) {
    this.interactionUrl = this.navigationService.getState().interactionUrl
    this.splits = this.interactionUrl.substr('airgap-wallet://?d='.length).split(',')
    this.wallets = this.navigationService.getState().wallets
    this.signedTxs = this.navigationService.getState().signedTxs
  }

  public switchQR(): void {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
