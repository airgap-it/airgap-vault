import { Component, OnInit } from '@angular/core'
import { AdvancedModeType, VaultStorageService, VaultStorageKey } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-advanced-mode',
  templateUrl: './advanced-mode.page.html',
  styleUrls: ['./advanced-mode.page.scss']
})
export class AdvancedModePage implements OnInit {
  public advancedModeType: AdvancedModeType = AdvancedModeType.UNDETERMINED

  advancedModeEnabled: boolean

  constructor(private readonly storageService: VaultStorageService) {
    this.storageService.get(VaultStorageKey.ADVANCED_MODE_TYPE).then((advancedMode) => {
      this.advancedModeType = advancedMode
      this.advancedModeEnabled = this.advancedModeType === AdvancedModeType.ADVANCED
    })
  }

  ngOnInit() {}

  public async toggleEnableAdvancedMode(event: any) {
    this.advancedModeEnabled = event.detail.checked
    if (this.advancedModeEnabled) {
      this.advancedModeType = AdvancedModeType.ADVANCED
    } else {
      this.advancedModeType = AdvancedModeType.SIMPLE
    }
    this.storageService.set(VaultStorageKey.ADVANCED_MODE_TYPE, this.advancedModeType)
  }
}
