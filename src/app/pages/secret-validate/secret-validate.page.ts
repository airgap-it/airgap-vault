import { Component, ViewChild } from '@angular/core'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-validate',
  templateUrl: './secret-validate.page.html',
  styleUrls: ['./secret-validate.page.scss']
})
export class SecretValidatePage {
  @ViewChild('verify', { static: true })
  public verify: VerifyKeyComponent

  public readonly secret: MnemonicSecret

  constructor(private readonly deviceService: DeviceService, private readonly navigationService: NavigationService) {
    this.secret = this.navigationService.getState().secret
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-setup' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public onContinue(): void {
    this.goToSecretAddPage()
  }

  public goToSecretAddPage(): void {
    this.navigationService.routeWithState('secret-add', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
