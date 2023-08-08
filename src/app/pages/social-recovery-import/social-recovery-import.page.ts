import { Component } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'

import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

// TODO Tim: remove

@Component({
  selector: 'airgap-social-recovery-import',
  templateUrl: './social-recovery-import.page.html',
  styleUrls: ['./social-recovery-import.page.scss']
})
export class SocialRecoveryImportPage {
  public numberOfShares: number
  public shares: string[]

  public socialRecoveryForm: UntypedFormGroup

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    public formBuilder: UntypedFormBuilder
  ) {
    this.setNumberOfShares(2)
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-setup' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public setNumberOfShares(i: number): void {
    this.numberOfShares = i
    this.shares = Array(i)

    const formGroup = {}

    this.getNumberArray(i).forEach((i) => {
      formGroup['share_' + i.toString()] = ['', Validators.compose([Validators.required, MnemonicValidator.isValidShare])]
      if (this.socialRecoveryForm && this.socialRecoveryForm.value['share_' + i.toString()]) {
        formGroup['share_' + i.toString()][0] = this.socialRecoveryForm.value['share_' + i.toString()]
      }
    })

    this.socialRecoveryForm = this.formBuilder.group(formGroup)
  }

  public recover(): void {
    try {
      const secretString: string = MnemonicSecret.recoverSecretFromShares(this.shares)
      this.navigationService
        .routeWithState('secret-add', { secret: new MnemonicSecret(secretString, 'Recovery by Social Recovery') })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (error) {
      console.error(error)
    }
  }

  public back(): void {
    this.navigationService.back()
  }

  public getNumberArray(numberOfElements: number): number[] {
    return Array(numberOfElements)
      .fill(0)
      .map((_value: number, index: number) => index)
  }
}
