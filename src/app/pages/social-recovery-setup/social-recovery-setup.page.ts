import { Component } from '@angular/core'
import * as bip39 from 'bip39'

import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'airgap-social-recovery-setup',
  templateUrl: './social-recovery-setup.page.html',
  styleUrls: ['./social-recovery-setup.page.scss']
})
export class SocialRecoverySetupPage {
  public numberOfShares: number = 3
  public numberOfRequiredShares: number = 2
  private secret: Secret
  public secretID: string

  constructor(
    private readonly secretService: SecretsService,
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(async (params) => {
      this.secretID = params['secretID']
      this.secret = this.secretService.getSecretById(this.secretID)
    })
  }

  public ionViewDidEnter(): void {
    this.deviceService.setSecureWindow()
  }

  public ionViewWillLeave(): void {
    this.deviceService.clearSecureWindow()
  }

  public setNumberOfShares(i: number): void {
    this.numberOfShares = i
    if (this.numberOfRequiredShares > this.numberOfShares) {
      this.numberOfRequiredShares = this.numberOfShares
    }
  }

  public setNumberOfRequiredShares(i: number): void {
    this.numberOfRequiredShares = i
  }

  public back(): void {
    this.navigationService.back()
  }

  public next(): void {
    this.secretService
      .retrieveEntropyForSecret(this.secret)
      .then((entropy) => {
        const shares: string[] = Secret.generateSocialRecover(
          bip39.entropyToMnemonic(entropy),
          this.numberOfShares,
          this.numberOfRequiredShares
        )
        this.navigationService
          .routeWithState('/social-recovery-show-share', { shares, currentShare: 0, secret: this.secret })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch((error) => {
        console.warn(error)
      })
  }
}
