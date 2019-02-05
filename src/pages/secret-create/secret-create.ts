import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { SecretGeneratePage } from '../secret-generate/secret-generate'
import { SecretImportPage } from '../secret-import/secret-import'
import { SocialRecoveryImportPage } from '../social-recovery-import/social-recovery-import'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SecretGenerateOnboardingPage } from '../secret-generate-onboarding/secret-generate-onboarding'
import { Storage } from '@ionic/storage'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'

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

  public async goToGenerate() {
    const hasShownDisclaimer = await this.storage.get('DISCLAIMER_GENERATE_INITIAL')
    if (hasShownDisclaimer) {
      this.navController.push(SecretGeneratePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.navController.push(SecretGenerateOnboardingPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  public goToImport() {
    this.navController.push(SecretImportPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToSocialRecoveryImport() {
    this.navController.push(SocialRecoveryImportPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
