import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-secret-create',
  templateUrl: './secret-create.page.html',
  styleUrls: ['./secret-create.page.scss']
})
export class SecretCreatePage {
  constructor(private readonly router: Router, private readonly secretsService: SecretsService, private readonly storage: Storage) {}

  public isRoot(): boolean {
    return this.secretsService.currentSecretsList.getValue().length === 0
  }

  public async goToGenerate(): Promise<void> {
    const hasShownDisclaimer: boolean = await this.storage.get('DISCLAIMER_GENERATE_INITIAL')
    if (hasShownDisclaimer) {
      this.router.navigate(['secret-generate']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.router.navigate(['secret-generate']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

      // this.router.navigate(['secret-generate-onboarding']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  public goToImport(): void {
    this.router.navigate(['secret-import']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToSocialRecoveryImport(): void {
    this.router.navigate(['social-recovery-import']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
