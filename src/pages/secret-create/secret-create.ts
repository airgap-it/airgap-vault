import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { SecretGeneratePage } from '../secret-generate/secret-generate'
import { SecretImportPage } from '../secret-import/secret-import'
import { SocialRecoveryImportPage } from '../social-recovery-import/social-recovery-import'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

@IonicPage()
@Component({
  selector: 'page-secret-create',
  templateUrl: 'secret-create.html'
})
export class SecretCreatePage {

  constructor(private navController: NavController, private secretsProvider: SecretsProvider) {

  }

  public isRoot(): boolean {
    return this.secretsProvider.currentSecretsList.getValue().length === 0
  }

  public goToGenerate() {
    this.navController.push(SecretGeneratePage)
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
