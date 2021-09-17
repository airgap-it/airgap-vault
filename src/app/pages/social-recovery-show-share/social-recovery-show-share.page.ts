import { Component } from '@angular/core'

import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-show-share',
  templateUrl: './social-recovery-show-share.page.html',
  styleUrls: ['./social-recovery-show-share.page.scss']
})
export class SocialRecoveryShowSharePage {
  public secret: MnemonicSecret
  public shares: string[]
  public currentShare: number = 0

  constructor(private readonly deviceService: DeviceService, private readonly navigationService: NavigationService) {
    this.shares = this.navigationService.getState().shares
    this.secret = this.navigationService.getState().secret
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'social-recovery-setup' })
    this.currentShare = this.navigationService.getState().currentShare
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public back() {
    this.navigationService.back()
  }

  public next() {
    this.navigationService
      .routeWithState('/social-recovery-validate-share', { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
