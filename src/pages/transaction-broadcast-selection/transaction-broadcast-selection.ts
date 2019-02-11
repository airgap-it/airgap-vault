import { TransactionSignedPage } from './../transaction-signed/transaction-signed'
import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Transaction } from '../../models/transaction.model'
import { SecretWalletInteractionPage } from '../secret-wallet-interaction/secret-wallet-interaction'
import { IWalletInteraction } from '../../models/walletInteraction.model'
import { AirGapWallet } from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'
import { InteractionProvider } from '../../providers/interaction/interaction'
import { DeepLinkProvider } from '../../providers/deep-link/deep-link'

@IonicPage()
@Component({
  selector: 'page-transaction-broadcast-selection',
  templateUrl: 'transaction-broadcast-selection.html'
})
export class TransactionBroadcastSelectionPage {
  signedTxQr?: string
  broadcastUrl?: string
  private transaction: Transaction
  private wallet: AirGapWallet

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    private interactionProvider: InteractionProvider,
    private deepLinkProvider: DeepLinkProvider
  ) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.broadcastUrl = this.navParams.get('broadcastUrl')
  }

  async selectOfflineDevice() {
    let interactionSetting = await this.interactionProvider.getInteractionSetting()
    const walletInteraction: IWalletInteraction = {
      communicationType: 'QR',
      operationType: 'transactionBroadcast',
      url: this.broadcastUrl,
      signedTxQr: this.signedTxQr,
      wallet: this.wallet,
      transaction: this.transaction
    }

    if (interactionSetting === 'always') {
      this.navController
        .push(TransactionSignedPage, {
          transaction: walletInteraction.transaction,
          wallet: walletInteraction.wallet,
          broadcastUrl: walletInteraction.url,
          signedTxQr: walletInteraction.signedTxQr
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.navController
        .push(SecretWalletInteractionPage, {
          walletInteractionModel: walletInteraction,
          selectedSetting: 'offline_device'
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  async selectSameDevice() {
    let interactionSetting = await this.interactionProvider.getInteractionSetting()
    const walletInteraction: IWalletInteraction = {
      communicationType: 'deepLink',
      operationType: 'transactionBroadcast',
      url: this.broadcastUrl
    }

    if (interactionSetting === 'always') {
      this.deepLinkProvider.sameDeviceDeeplink(this.broadcastUrl)
    } else {
      this.navController
        .push(SecretWalletInteractionPage, {
          walletInteractionModel: walletInteraction,
          selectedSetting: 'same_device'
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
