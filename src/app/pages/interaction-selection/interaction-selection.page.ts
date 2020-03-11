import { Component } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import {
  IInteractionOptions,
  InteractionCommunicationType,
  InteractionService,
  InteractionSetting
} from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-interaction-selection',
  templateUrl: './interaction-selection.page.html',
  styleUrls: ['./interaction-selection.page.scss']
})
export class InteractionSelectionPage {
  private interactionOptions: IInteractionOptions

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {}

  public ionViewDidEnter(): void {
    this.interactionOptions = this.navigationService.getState().interactionOptions
  }

  public async selectOfflineDevice(): Promise<void> {
    this.interactionOptions.communicationType = InteractionCommunicationType.QR
    this.goToNextPage()
  }

  public async selectSameDevice(): Promise<void> {
    this.interactionOptions.communicationType = InteractionCommunicationType.DEEPLINK
    this.goToNextPage()
  }

  private goToNextPage(): void {
    const secret = this.secretsService.getActiveSecret()
    if (secret.interactionSetting === InteractionSetting.UNDETERMINED) {
      this.goToInteractionSelectionSettingsPage(this.interactionOptions)
    } else {
      this.interactionService.startInteraction(this.interactionOptions, secret)
    }
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions): void {
    this.navigationService
      .routeWithState('/interaction-selection-settings', { interactionOptions })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
