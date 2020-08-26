import { Component, ViewChild } from '@angular/core'

import { VerifyKeyComponent } from '../../components/verify-key/verify-key.component'
import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ActivatedRoute } from '@angular/router'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

@Component({
  selector: 'airgap-secret-validate',
  templateUrl: './secret-validate.page.html',
  styleUrls: ['./secret-validate.page.scss']
})
export class SecretValidatePage {
  @ViewChild('verify', { static: true })
  public verify: VerifyKeyComponent

  public secret: Secret
  private secretID: string
  public mnemonic: string

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private activatedRoute: ActivatedRoute,
    private readonly secretsService: SecretsService
  ) {
    this.activatedRoute.params.subscribe(async (params) => {
      this.secretID = params['secretID']
      this.secret = this.secretsService.getSecretById(this.secretID)
      this.mnemonic = await this.secretsService.retrieveEntropyForSecret(this.secret).then((entropy: string) => {
        return this.secret.recoverMnemonicFromHex(entropy)
      })
    })
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-create' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public onContinue(): void {
    this.goToSecretEditPage()
  }

  public goToSecretEditPage(): void {
    this.navigationService.route(`secret-edit/${this.secretID}/${'generate'}`).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
