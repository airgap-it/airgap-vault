import { Component, ViewChild } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { SecureBasePage } from '../../secure-base/secure-base.page'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-validate',
  templateUrl: './secret-validate.page.html',
  styleUrls: ['./secret-validate.page.scss']
})
export class SecretValidatePage extends SecureBasePage {
  @ViewChild('verify', { static: true })
  public verify: VerifyKeyComponent

  public readonly secret: Secret

  constructor(deviceProvider: DeviceService, modalController: ModalController, protected readonly navigationService: NavigationService) {
    super(navigationService, deviceProvider, modalController)
    this.secret = this.navigationService.getState().secret
  }

  public ionViewDidEnter(): void {
    super.ionViewDidEnter()
  }

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
  }

  public onContinue(): void {
    this.goToSecretEditPage()
  }

  public goToSecretEditPage(): void {
    this.navigationService
      .routeWithState('secret-edit', { secret: this.secret, isGenerating: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
