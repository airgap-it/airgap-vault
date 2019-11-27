import { Component, OnInit } from '@angular/core'

import { Secret } from '../../models/secret'
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
  selector: 'airgap-interaction-selection-settings',
  templateUrl: './interaction-selection-settings.page.html',
  styleUrls: ['./interaction-selection-settings.page.scss']
})
export class InteractionSelectionSettingsPage implements OnInit {
  public interactionSetting: typeof InteractionSetting = InteractionSetting
  public selectedSetting: InteractionSetting | undefined
  public isEdit: boolean = false
  private secret: Secret

  private readonly interactionOptions: IInteractionOptions

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretService: SecretsService,
    private readonly interactionService: InteractionService
  ) {
    console.log('state', this.navigationService.getState())
    this.isEdit = this.navigationService.getState().isEdit
    this.interactionOptions = this.navigationService.getState().interactionOptions
  }

  public async ngOnInit(): Promise<void> {
    if (this.isEdit) {
      this.secret = this.navigationService.getState().secret
      this.selectedSetting = this.secret.interactionSetting
    } else {
      this.secret = this.secretService.getActiveSecret()
      console.log('SECRET SET', this.secret)
      this.selectedSetting =
        this.interactionOptions.communicationType === InteractionCommunicationType.QR
          ? InteractionSetting.OFFLINE_DEVICE
          : this.interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK
          ? InteractionSetting.SAME_DEVICE
          : undefined
      this.secret.interactionSetting = this.selectedSetting || InteractionSetting.UNDETERMINED // Default to store is undetermined
      this.selectedSetting = this.selectedSetting || InteractionSetting.ALWAYS_ASK // Default to display is always ask
      this.secretService.addOrUpdateSecret(this.secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    }
  }

  public onSelectedSettingChange(selectedSetting: InteractionSetting): void {
    console.log('change!')
    this.secret.interactionSetting = selectedSetting
    this.secretService.addOrUpdateSecret(this.secret)
  }

  public goToNextPage(): void {
    this.interactionService.startInteraction(this.interactionOptions, this.secret)
  }

  public goBack(): void {
    this.navigationService.back()
  }
}
