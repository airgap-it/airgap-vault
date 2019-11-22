import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { SecureBasePage } from '../../secure-base/secure-base.page'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-show-share',
  templateUrl: './social-recovery-show-share.page.html',
  styleUrls: ['./social-recovery-show-share.page.scss']
})
export class SocialRecoveryShowSharePage extends SecureBasePage {
  public secret: Secret
  public shares: string[]
  public currentShare: number

  constructor(deviceProvider: DeviceService, modalController: ModalController, protected readonly navigationService: NavigationService) {
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

  public back() {
    this.navigationService.back()
  }

  public next() {
    this.navigationService
      .routeWithState('/social-recovery-validate-share', { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
