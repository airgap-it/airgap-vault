import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { SecretGeneratePage } from '../secret-generate/secret-generate'
import { SecretImportPage } from '../secret-import/secret-import'
import { SocialRecoveryImportPage } from '../social-recovery-import/social-recovery-import'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecretGenerateOnboardingPage } from '../secret-generate-onboarding/secret-generate-onboarding'
import { Storage } from '@ionic/storage'

@IonicPage()
@Component({
  selector: 'page-secret-create',
  templateUrl: 'secret-create.html'
})
export class SecretCreatePage {
  constructor(private navController: NavController, private secretsProvider: SecretsProvider, private storage: Storage) {}

  public isRoot(): boolean {
    return this.secretsProvider.currentSecretsList.getValue().length === 0
  }

  public goToGenerate() {
    this.storage.get('DISCLAIMER_GENERATE_INITIAL').then(val => {
      if (val) {
        this.navController.push(SecretGeneratePage)
      } else {
        this.navController.push(SecretGenerateOnboardingPage)
      }
    })
  }

  public goToImport() {
    this.navController.push(SecretImportPage)
  }

  public goToSocialRecoveryImport() {
    this.navController.push(SocialRecoveryImportPage)
  }

  public close() {
    this.navController.popToRoot()
  }
}
