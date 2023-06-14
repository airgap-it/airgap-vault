import { Component, OnInit } from '@angular/core'
import { InteractionType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

import { IInteractionOptions, InteractionCommunicationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-interaction-selection-settings',
  templateUrl: './interaction-selection-settings.page.html',
  styleUrls: ['./interaction-selection-settings.page.scss']
})
export class InteractionSelectionSettingsPage implements OnInit {
  public selectedType: InteractionType | undefined

  public isEdit: boolean = false
  public isOnboardingFlow: boolean = false

  private readonly interactionOptions?: IInteractionOptions

  constructor(
    private readonly navigationService: NavigationService,
    private readonly interactionService: InteractionService,
    private readonly storageService: VaultStorageService,
    private readonly modalController: ModalController
  ) {
    this.interactionOptions = this.navigationService.getState().interactionOptions

    this.storageService.get(VaultStorageKey.INTERACTION_TYPE).then((interactionType) => {
      this.isOnboardingFlow = interactionType === InteractionType.UNDETERMINED
    })
  }

  public async ngOnInit(): Promise<void> {
    this.selectedType = await this.interactionService.getInteractionType()

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
  }

  public async goToNextPage(): Promise<void> {
    if (this.interactionOptions) {
      await this.interactionService.startInteraction(this.interactionOptions)
    } else {
      this.navigationService.back()
    }
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
