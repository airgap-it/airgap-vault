import { SerializerService } from '@airgap/angular-core'
import { Component } from '@angular/core'

@Component({
  selector: 'app-qr-settings',
  templateUrl: './qr-settings.page.html',
  styleUrls: ['./qr-settings.page.scss']
})
export class QrSettingsPage {
  constructor(public readonly serializerService: SerializerService) {}

  public async resetSettings(): Promise<void> {
    await this.serializerService.resetSettings()
  }
}
