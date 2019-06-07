import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'

import {
  IInteractionOptions,
  InteractionCommunicationType,
  InteractionService,
  InteractionSetting
} from '../../services/interaction/interaction.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-interaction-selection',
  templateUrl: './interaction-selection.page.html',
  styleUrls: ['./interaction-selection.page.scss']
})
export class InteractionSelectionPage {
  private readonly interactionOptions: IInteractionOptions

  constructor(
    public navCtrl: NavController,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {
    // TODO
    // this.interactionOptions = this.navParams.get('interactionOptions')
  }

  public async selectOfflineDevice() {
    this.interactionOptions.communicationType = InteractionCommunicationType.QR
    this.goToNextPage()
  }

  public async selectSameDevice() {
    this.interactionOptions.communicationType = InteractionCommunicationType.DEEPLINK
    this.goToNextPage()
  }

  private goToNextPage() {
    const secret = this.secretsService.getActiveSecret()
    if (secret.interactionSetting === InteractionSetting.UNDETERMINED) {
      this.goToInteractionSelectionSettingsPage(this.interactionOptions)
    } else {
      this.interactionService.startInteraction(this.navCtrl, this.interactionOptions, secret)
    }
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions) {
    // TODO
    // this.navCtrl
    //   .push(InteractionSelectionSettingsPage, {
    //     interactionOptions: interactionOptions
    //   })
    //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
