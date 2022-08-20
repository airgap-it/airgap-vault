import { Component, OnInit } from '@angular/core'
import { InteractionType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

import { IInteractionOptions, InteractionCommunicationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-interaction-selection-settings',
  templateUrl: './interaction-selection-settings.page.html',
  styleUrls: ['./interaction-selection-settings.page.scss']
})
export class InteractionSelectionSettingsPage implements OnInit {
  public interactionType: typeof InteractionType = InteractionType
  public initialType: InteractionType | undefined
  public selectedType: InteractionType | undefined
  public isEdit: boolean = false

  private readonly interactionOptions?: IInteractionOptions

  constructor(
    private readonly navigationService: NavigationService,
    private readonly interactionService: InteractionService,
    private readonly storageService: VaultStorageService
  ) {
    this.interactionOptions = this.navigationService.getState().interactionOptions
  }

  public async ngOnInit(): Promise<void> {
    this.selectedType = await this.storageService.get(VaultStorageKey.INTERACTION_TYPE)

    if (this.selectedType === InteractionType.UNDETERMINED) {
      if (this.interactionOptions) {
        this.selectedType =
          this.interactionOptions.communicationType === InteractionCommunicationType.QR
            ? InteractionType.QR_CODE
            : this.interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK
            ? InteractionType.DEEPLINK
            : undefined
      } else {
        this.selectedType = InteractionType.ALWAYS_ASK
      }
    }

    this.initialType = this.selectedType
  }

  public goToNextPage(): void {
    if (this.selectedType) {
      this.storageService.set(VaultStorageKey.INTERACTION_TYPE, this.selectedType)
    }

    if (this.interactionOptions) {
      this.interactionService.startInteraction(this.interactionOptions)
    } else {
      this.navigationService.back()
    }
  }
}
