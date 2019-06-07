import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'app-local-authentication-onboarding',
  templateUrl: './local-authentication-onboarding.page.html',
  styleUrls: ['./local-authentication-onboarding.page.scss']
})
export class LocalAuthenticationOnboardingPage {
  constructor(public modalController: ModalController, private readonly storage: Storage) {}

  public async authenticate(): Promise<void> {
    await this.storage.set('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING', true)
    this.modalController.dismiss({ authenticated: true }).catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
