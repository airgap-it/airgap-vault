import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { SecretGeneratePage } from '../secret-generate/secret-generate'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-secret-generate-onboarding',
  templateUrl: 'secret-generate-onboarding.html'
})
export class SecretGenerateOnboardingPage {
  constructor(public navCtrl: NavController, private storage: Storage) {}

  async continue() {
    await this.storage.set('DISCLAIMER_GENERATE_INITIAL', true)
    this.navCtrl.push(SecretGeneratePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
