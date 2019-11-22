import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ModalController } from '@ionic/angular'

import { Secret } from '../../models/secret'
import { SecureBasePage } from '../../secure-base/secure-base.page'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

@Component({
  selector: 'airgap-social-recovery-import',
  templateUrl: './social-recovery-import.page.html',
  styleUrls: ['./social-recovery-import.page.scss']
})
export class SocialRecoveryImportPage extends SecureBasePage {
  public numberOfShares: number
  public shares: string[]

  public socialRecoveryForm: FormGroup

  constructor(
    deviceProvider: DeviceService,
    modalController: ModalController,
    protected readonly navigationService: NavigationService,
    public formBuilder: FormBuilder
  ) {
    super(navigationService, deviceProvider, modalController)

    this.setNumberOfShares(2)
  }

  public ionViewDidEnter(): void {
    super.ionViewDidEnter()
  }

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
  }

  public setNumberOfShares(i: number): void {
    this.numberOfShares = i
    this.shares = Array(i)

    const formGroup = {}

    this.getNumberArray(i).forEach(i => {
      formGroup['share_' + i.toString()] = ['', Validators.compose([Validators.required, MnemonicValidator.isValidShare])]
      if (this.socialRecoveryForm && this.socialRecoveryForm.value['share_' + i.toString()]) {
        formGroup['share_' + i.toString()][0] = this.socialRecoveryForm.value['share_' + i.toString()]
      }
    })

    this.socialRecoveryForm = this.formBuilder.group(formGroup)
  }

  public recover(): void {
    try {
      const secretString: string = Secret.recoverSecretFromShares(this.shares)
      this.navigationService
        .routeWithState('secret-edit', { secret: new Secret(secretString, 'Recovery by Social Recovery') })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (error) {
      console.log('oops')
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
