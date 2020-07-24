import { Component, ViewChild } from '@angular/core'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-social-recovery-validate-share',
  templateUrl: './social-recovery-validate-share.page.html',
  styleUrls: ['./social-recovery-validate-share.page.scss']
})
export class SocialRecoveryValidateSharePage {
  @ViewChild('verify', { static: true })
  public verify: VerifyKeyComponent

  public validated: boolean = false
  public shares: string[]
  public currentShare: number
  public secret: Secret

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService
  ) {
    this.shares = this.navigationService.getState().shares
    this.secret = this.navigationService.getState().secret
    this.currentShare = this.navigationService.getState().currentShare
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'social-recovery-setup' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
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
