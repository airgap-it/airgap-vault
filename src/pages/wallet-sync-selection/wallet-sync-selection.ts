import { DeepLinkProvider } from './../../providers/deep-link/deep-link'
import { InteractionProvider } from './../../providers/interaction/interaction'
import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'
import { SecretWalletInteractionPage } from '../secret-wallet-interaction/secret-wallet-interaction'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { IWalletInteraction } from '../../models/walletInteraction.model'
import { ShareUrlProvider } from '../../providers/share-url/share-url'

@IonicPage()
@Component({
  selector: 'page-wallet-sync-selection',
  templateUrl: 'wallet-sync-selection.html'
})
export class WalletSyncSelectionPage {
  private wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private interactionProvider: InteractionProvider,
    private deepLinkProvider: DeepLinkProvider,
    private shareUrlProvider: ShareUrlProvider
  ) {
    this.wallet = this.navParams.get('wallet')
  }

  async ionViewDidEnter() {
    console.log('WalletSyncSelectionPage')
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
  }

  async selectOfflineDevice() {
    let interactionSetting = await this.interactionProvider.getInteractionSetting()
    const walletInteraction: IWalletInteraction = {
      communicationType: 'QR',
      operationType: 'walletSync',
      url: this.walletShareUrl
    }

    if (interactionSetting === 'always') {
      this.navCtrl.push(WalletSharePage, { walletShareUrl: walletInteraction.url }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.navCtrl
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
      operationType: 'walletSync',
      url: this.walletShareUrl
    }
    if (interactionSetting === 'always') {
      this.deepLinkProvider.sameDeviceDeeplink(this.walletShareUrl)
    } else {
      this.navCtrl
        .push(SecretWalletInteractionPage, {
          walletInteractionModel: walletInteraction,
          selectedSetting: 'same_device'
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
