import { Component, OnInit } from '@angular/core'
import { InteractionService } from 'src/app/services/interaction/interaction.service'
import { InstallationType, InteractionType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-vault-interaction-settings',
  templateUrl: './vault-interaction-settings.page.html',
  styleUrls: ['./vault-interaction-settings.page.scss']
})
export class VaultInteractionSettingsPage implements OnInit {
  public connectionEnabled: boolean = false

  public interactionType: typeof InteractionType = InteractionType
  public initialType: InteractionType | undefined
  public selectedType: InteractionType | undefined

  private installationType: InstallationType

  constructor(private readonly interactionService: InteractionService, private readonly storageService: VaultStorageService) {
    this.interactionService
    this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((installationType) => {
      this.installationType = installationType
      this.connectionEnabled = this.installationType !== 'OFFLINE'
    })
  }

  ngOnInit() {}

  public async toggleEnableConnection(event: any) {
    this.connectionEnabled = event.detail.checked
    if (this.connectionEnabled === false) {
      this.interactionService.resetInteractionType()
    }
    this.setInstallationType()
  }

  private setInstallationType() {
    this.installationType = this.connectionEnabled ? InstallationType.ALWAYS_ASK : InstallationType.OFFLINE
    this.storageService.set(VaultStorageKey.INSTALLATION_TYPE, this.installationType)
  }
}
