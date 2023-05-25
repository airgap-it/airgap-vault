import { Component, OnInit } from '@angular/core'
import { IInteractionOptions, InteractionCommunicationType, InteractionService } from 'src/app/services/interaction/interaction.service'
import { InteractionType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-interaction-selection',
  templateUrl: './interaction-selection.component.html',
  styleUrls: ['./interaction-selection.component.scss']
})
export class InteractionSelectionComponent implements OnInit {
  public interactionType: typeof InteractionType = InteractionType
  public initialType: InteractionType | undefined
  public selectedType: InteractionType | undefined
  public isEdit: boolean = false

  private readonly interactionOptions?: IInteractionOptions

  constructor(private readonly storageService: VaultStorageService, private readonly interactionService: InteractionService) {}

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
  changeInteraction(type: InteractionType) {
    this.interactionService.changeInteractionType(type)
  }
}
