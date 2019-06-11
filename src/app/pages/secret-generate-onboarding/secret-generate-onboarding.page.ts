import { Component } from '@angular/core'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-generate-onboarding',
  templateUrl: './secret-generate-onboarding.page.html',
  styleUrls: ['./secret-generate-onboarding.page.scss']
})
export class SecretGenerateOnboardingPage {
  constructor(private readonly navigationService: NavigationService, private readonly storage: Storage) {}

  public async continue(): Promise<void> {
    await this.storage.set('DISCLAIMER_GENERATE_INITIAL', true)
    this.navigationService.route('secret-generate').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
