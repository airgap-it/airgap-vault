import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { first } from 'rxjs/operators'

import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'
import { InstallationTypePage } from '../Installation-type/installation-type.page'

@Component({
  selector: 'airgap-secret-setup',
  templateUrl: './secret-setup.page.html',
  styleUrls: ['./secret-setup.page.scss']
})
export class SecretSetupPage implements OnInit {
  public canGoBack: boolean = false

  public isAdvancedMode: boolean = false

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly modalController: ModalController,
    private readonly deviceService: DeviceService,
    private readonly storageService: VaultStorageService
  ) {}

  public ngOnInit(): void {
    this.secretsService
      .getSecretsObservable()
      .pipe(first())
      .subscribe((secrets: MnemonicSecret[]) => {
        if (secrets.length > 0) {
          this.canGoBack = true
        }
      })
  }

  public ionViewDidEnter(): void {
    this.deviceService.setSecureWindow()
  }

  public ionViewWillLeave(): void {
    this.deviceService.clearSecureWindow()
  }

  public async goToGenerate(): Promise<void> {
    const hasShownDisclaimer: boolean = await this.storageService.get(VaultStorageKey.DISCLAIMER_GENERATE_INITIAL)
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

  public goToDiceRollPage(): void {
    this.navigationService.route('/secret-generate-dice').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToCoinFlipPage(): void {
    this.navigationService.route('/secret-generate-coin-flip').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToSeedXOR(): void {
    this.navigationService.route('/seed-xor-import').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
  
  public async goToInstallationTypePage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: InstallationTypePage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
