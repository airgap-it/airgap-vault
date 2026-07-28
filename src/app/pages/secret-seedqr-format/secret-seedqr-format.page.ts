import { Component } from '@angular/core'

import { MnemonicSecret } from '../../models/secret'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-seedqr-format',
  templateUrl: './secret-seedqr-format.page.html',
  styleUrls: ['./secret-seedqr-format.page.scss']
})
export class SecretSeedqrFormatPage {
  public secret: MnemonicSecret

  public selectedFormat: 'standard' | 'compact' = 'standard'

  constructor(private readonly navigationService: NavigationService) {
    this.secret = this.navigationService.getState().secret
  }

  public continue(): void {
    this.navigationService.routeWithState('secret-seedqr', {
      secret: this.secret,
      format: this.selectedFormat
    })
  }
}