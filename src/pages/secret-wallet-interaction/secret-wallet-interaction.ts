import { DeepLinkProvider } from './../../providers/deep-link/deep-link'
import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { InteractionProvider } from '../../providers/interaction/interaction'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { IWalletInteraction } from '../../models/walletInteraction.model'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

declare let window: any

@IonicPage()
@Component({
  selector: 'page-secret-wallet-interaction',
  templateUrl: 'secret-wallet-interaction.html'
})
export class SecretWalletInteractionPage {
  private selectedSetting: string
  private walletShareUrl: string
  private isEdit = false

  private walletInteraction: IWalletInteraction
  broadcastUrl?: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private interactionProvider: InteractionProvider,
    private platform: Platform,
    private deepLinkProvider: DeepLinkProvider
  ) {}

  async ionViewDidEnter() {
    this.isEdit = await this.navParams.get('isEdit')
    this.walletInteraction = await this.navParams.get('walletInteractionModel')

    if (this.isEdit) {
      this.selectedSetting = await this.interactionProvider.getInteractionSetting()
    } else {
      this.selectedSetting = await this.navParams.get('selectedSetting')
      this.interactionProvider.setInteractionSetting(this.selectedSetting).catch(handleErrorLocal(ErrorCategory.INTERACTION_PROVIDER))
    }
  }

  onSelectedSettingChange(selectedSetting) {
    this.interactionProvider.setInteractionSetting(selectedSetting).catch(handleErrorLocal(ErrorCategory.INTERACTION_PROVIDER))
  }

  goToNextPage() {
    if (this.walletInteraction.communicationType === 'QR' && this.walletInteraction.operationType === 'walletSync') {
      this.navCtrl
        .push(WalletSharePage, { walletShareUrl: this.walletInteraction.url })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (this.walletInteraction.communicationType === 'QR' && this.walletInteraction.operationType === 'transactionBroadcast') {
      this.navCtrl
        .push(TransactionSignedPage, {
          transaction: this.walletInteraction.transaction,
          wallet: this.walletInteraction.wallet,
          broadcastUrl: this.walletInteraction.url,
          signedTxQr: this.walletInteraction.signedTxQr
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (this.walletInteraction.communicationType === 'deepLink' && this.walletInteraction.operationType === 'walletSync') {
      this.deepLinkProvider.sameDeviceDeeplink(this.walletShareUrl)
    } else if (this.walletInteraction.communicationType === 'deepLink' && this.walletInteraction.operationType === 'transactionBroadcast') {
      this.deepLinkProvider.sameDeviceDeeplink(this.broadcastUrl)
    }
  }

  popToRoot() {
    this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
