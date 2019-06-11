import { Component, OnInit } from '@angular/core'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-create',
  templateUrl: './secret-create.page.html',
  styleUrls: ['./secret-create.page.scss']
})
export class SecretCreatePage implements OnInit {
  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly storage: Storage
  ) {}

  public ngOnInit(): void {
    // console.log(this.router.getCurrentNavigation())
    // console.log(this.router.getCurrentNavigation().extras.state)
  }

  public canGoBack(): boolean {
    return this.secretsService.currentSecretsList.getValue().length > 0
  }

  public async goToGenerate(): Promise<void> {
    const hasShownDisclaimer: boolean = await this.storage.get('DISCLAIMER_GENERATE_INITIAL')
    if (hasShownDisclaimer) {
      this.navigationService.route('/secret-generate').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      this.navigationService.route('/secret-generate-onboarding').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  public goToImport(): void {
    this.navigationService.route('/secret-import').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToSocialRecoveryImport(): void {
    this.navigationService.route('/social-recovery-import').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
