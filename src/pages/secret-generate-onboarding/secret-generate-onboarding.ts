import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { SecretGeneratePage } from '../secret-generate/secret-generate'
import { PermissionsProvider } from '../../providers/permissions/permissions'

@IonicPage()
@Component({
  selector: 'page-secret-generate-onboarding',
  templateUrl: 'secret-generate-onboarding.html'
})
export class SecretGenerateOnboardingPage {
  constructor(public navCtrl: NavController, private storage: Storage, private permissionsProvider: PermissionsProvider) {}

  async continue() {
    await this.storage.set('DISCLAIMER_GENERATE_INITIAL', true)
    this.navCtrl.push(SecretGeneratePage)
  }
}
