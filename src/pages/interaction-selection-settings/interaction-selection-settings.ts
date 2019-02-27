import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { WalletSharePage } from '../wallet-share/wallet-share'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'
import { InteractionSetting } from '../../providers/interaction/interaction'
import {
  IInteractionOptions,
  InteractionOperationType,
  InteractionCommunicationType,
  InteractionProvider
} from '../../providers/interaction/interaction'

declare let window: any

@IonicPage()
@Component({
  selector: 'page-interaction-selection-settings',
  templateUrl: 'interaction-selection-settings.html'
})
export class InteractionSelectionSettingsPage {
  public interactionSetting = InteractionSetting
  public selectedSetting: InteractionSetting
  public isEdit = false
  private secret: Secret

  private interactionOptions: IInteractionOptions

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private secretProvider: SecretsProvider,
    private platform: Platform,
    private interactionProvider: InteractionProvider
  ) {}

  async ionViewWillLoad() {
    this.isEdit = await this.navParams.get('isEdit')
    this.interactionOptions = await this.navParams.get('interactionOptions')

    if (this.isEdit) {
      this.secret = this.navParams.get('secret')
      this.selectedSetting = this.secret.interactionSetting
    } else {
      this.secret = this.secretProvider.getActiveSecret()
      this.selectedSetting =
        this.interactionOptions.communicationType === InteractionCommunicationType.QR
          ? InteractionSetting.OFFLINE_DEVICE
          : this.interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK
          ? InteractionSetting.SAME_DEVICE
          : undefined
      this.secret.interactionSetting = this.selectedSetting || InteractionSetting.UNDETERMINED // Default to store is undetermined
      this.selectedSetting = this.selectedSetting || InteractionSetting.ALWAYS_ASK // Default to display is always ask
      this.secretProvider.addOrUpdateSecret(this.secret)
    }
  }

  onSelectedSettingChange(selectedSetting) {
    this.secret.interactionSetting = selectedSetting
    this.secretProvider.addOrUpdateSecret(this.secret)
  }

  goToNextPage() {
    this.interactionProvider.startInteraction(this.navCtrl, this.interactionOptions, this.secret)
  }

  popToRoot() {
    this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
