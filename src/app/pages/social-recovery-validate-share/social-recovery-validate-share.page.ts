import { Component, ViewChild } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { SecureBasePage } from '../../secure-base/secure-base.page'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-social-recovery-validate-share',
  templateUrl: './social-recovery-validate-share.page.html',
  styleUrls: ['./social-recovery-validate-share.page.scss']
})
export class SocialRecoveryValidateSharePage extends SecureBasePage {
  @ViewChild('verify', { static: false })
  public verify: VerifyKeyComponent

  public validated: boolean = false
  public shares: string[]
  public currentShare: number
  public secret: Secret

  constructor(
    deviceProvider: DeviceService,
    modalController: ModalController,
    protected readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService
  ) {
    super(navigationService, deviceProvider, modalController)

    this.shares = this.navigationService.getState().shares
    this.secret = this.navigationService.getState().secret
    this.currentShare = this.navigationService.getState().currentShare
  }

  public ionViewDidEnter(): void {
    super.ionViewDidEnter()
  }

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
  }

  public onComplete(isCorrect: boolean) {
    this.validated = isCorrect
  }

  public onContinue() {
    this.next.bind(this)()
  }

  public back() {
    this.navigationService.back()
  }

  public next() {
    if (this.shares.length === this.currentShare + 1) {
      this.secret.hasSocialRecovery = true
      this.secretsService
        .addOrUpdateSecret(this.secret)
        .then(() => {
          // TODO: Route back to secret detail page
          this.navigationService.route('/tabs/tab-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    } else {
      this.navigationService
        .routeWithState('/social-recovery-show-share', { shares: this.shares, currentShare: this.currentShare + 1, secret: this.secret })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
