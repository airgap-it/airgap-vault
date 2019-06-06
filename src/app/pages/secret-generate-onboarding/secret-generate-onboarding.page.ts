import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'app-secret-generate-onboarding',
  templateUrl: './secret-generate-onboarding.page.html',
  styleUrls: ['./secret-generate-onboarding.page.scss']
})
export class SecretGenerateOnboardingPage {
  constructor(public router: Router, private readonly storage: Storage) {}

  public async continue() {
    await this.storage.set('DISCLAIMER_GENERATE_INITIAL', true)
    this.router.navigateByUrl('secret-generate').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
