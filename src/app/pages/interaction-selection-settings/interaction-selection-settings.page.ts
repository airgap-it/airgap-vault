import { Component } from '@angular/core'
import { NavController, Platform } from '@ionic/angular'

import { Secret } from '../../models/secret'
import {
  IInteractionOptions,
  InteractionCommunicationType,
  InteractionService,
  InteractionSetting
} from '../../services/interaction/interaction.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-interaction-selection-settings',
  templateUrl: './interaction-selection-settings.page.html',
  styleUrls: ['./interaction-selection-settings.page.scss']
})
export class InteractionSelectionSettingsPage {
  public interactionSetting = InteractionSetting
  public selectedSetting: InteractionSetting
  public isEdit = false
  private secret: Secret

  private readonly interactionOptions: IInteractionOptions

  constructor(
    public navCtrl: NavController,
    private readonly secretService: SecretsService,
    private readonly platform: Platform,
    private readonly interactionService: InteractionService
  ) {}

  public async ionViewWillLoad() {
    // TODO
    // this.isEdit = await this.navParams.get('isEdit')
    // this.interactionOptions = await this.navParams.get('interactionOptions')

    if (this.isEdit) {
      // this.secret = this.navParams.get('secret')
      this.selectedSetting = this.secret.interactionSetting
    } else {
      this.secret = this.secretService.getActiveSecret()
      this.selectedSetting =
        this.interactionOptions.communicationType === InteractionCommunicationType.QR
          ? InteractionSetting.OFFLINE_DEVICE
          : this.interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK
          ? InteractionSetting.SAME_DEVICE
          : undefined
      this.secret.interactionSetting = this.selectedSetting || InteractionSetting.UNDETERMINED // Default to store is undetermined
      this.selectedSetting = this.selectedSetting || InteractionSetting.ALWAYS_ASK // Default to display is always ask
      this.secretService.addOrUpdateSecret(this.secret)
    }
  }

  public onSelectedSettingChange(selectedSetting) {
    this.secret.interactionSetting = selectedSetting
    this.secretService.addOrUpdateSecret(this.secret)
  }

  public goToNextPage() {
    this.interactionService.startInteraction(this.navCtrl, this.interactionOptions, this.secret)
  }

  public popToRoot() {
    // TODO
    // this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
