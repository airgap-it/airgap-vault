import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'
import { InteractionSelectionSettingsPage } from '../interaction-selection-settings/interaction-selection-settings'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { ShareUrlProvider } from '../../providers/share-url/share-url'
import {
  InteractionSetting,
  InteractionProvider,
  IInteractionOptions,
  InteractionCommunicationType
} from '../../providers/interaction/interaction'
import { Transaction } from '../../models/transaction.model'
import { Secret } from '../../models/secret'

@IonicPage()
@Component({
  selector: 'page-interaction-selection',
  templateUrl: 'interaction-selection.html'
})
export class InteractionSelectionPage {
  private interactionOptions: IInteractionOptions

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private secretsProvider: SecretsProvider,
    private interactionProvider: InteractionProvider
  ) {
    this.interactionOptions = this.navParams.get('interactionOptions')
  }

  async selectOfflineDevice() {
    this.interactionOptions.communicationType = InteractionCommunicationType.QR
    this.goToNextPage()
  }

  async selectSameDevice() {
    this.interactionOptions.communicationType = InteractionCommunicationType.DEEPLINK
    this.goToNextPage()
  }

  private goToNextPage() {
    const secret = this.secretsProvider.getActiveSecret()
    if (secret.interactionSetting === InteractionSetting.UNDETERMINED) {
      this.goToInteractionSelectionSettingsPage(this.interactionOptions)
    } else {
      this.interactionProvider.startInteraction(this.navCtrl, this.interactionOptions, secret)
    }
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions) {
    this.navCtrl
      .push(InteractionSelectionSettingsPage, {
        interactionOptions: interactionOptions
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
