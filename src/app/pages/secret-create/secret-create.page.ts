import { Component, OnInit } from '@angular/core'
import { Storage } from '@ionic/storage'
import { first } from 'rxjs/operators'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-secret-create',
  templateUrl: './secret-create.page.html',
  styleUrls: ['./secret-create.page.scss']
})
export class SecretCreatePage implements OnInit {
  public canGoBack: boolean = false

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly storage: Storage
  ) {}

  public ngOnInit(): void {
    this.secretsService
      .getSecretsObservable()
      .pipe(first())
      .subscribe((secrets: Secret[]) => {
        if (secrets.length > 0) {
          this.canGoBack = true
        }
      })
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
