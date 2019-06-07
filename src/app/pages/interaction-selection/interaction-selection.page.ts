import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'

import {
  IInteractionOptions,
  InteractionCommunicationType,
  InteractionService,
  InteractionSetting
} from '../../services/interaction/interaction.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { Router } from '@angular/router'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-interaction-selection',
  templateUrl: './interaction-selection.page.html',
  styleUrls: ['./interaction-selection.page.scss']
})
export class InteractionSelectionPage {
  private readonly interactionOptions: IInteractionOptions

  constructor(
    private readonly router: Router,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {
    this.interactionOptions = window.history.state.interactionOptions
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
      this.interactionService.startInteraction(this.interactionOptions, secret)
    }
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions) {
    this.router
      .navigateByUrl('/interaction-selection-settings', { state: { interactionOptions } })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
