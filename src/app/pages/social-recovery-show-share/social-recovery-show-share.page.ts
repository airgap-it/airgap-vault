import { Component } from '@angular/core'

import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-show-share',
  templateUrl: './social-recovery-show-share.page.html',
  styleUrls: ['./social-recovery-show-share.page.scss']
})
export class SocialRecoveryShowSharePage {
  public secret: Secret
  public shares: string[]
  public currentShare: number

  constructor(private readonly deviceService: DeviceService, private readonly navigationService: NavigationService) {
    this.shares = this.navigationService.getState().shares
    this.secret = this.navigationService.getState().secret
    this.currentShare = this.navigationService.getState().currentShare
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection()
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
