import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MnemonicSecret } from 'src/app/models/secret'
import { DeviceService } from 'src/app/services/device/device.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SeedXorService } from 'src/app/services/seed-xor/seed-xor.service'
import { MnemonicValidator } from 'src/app/validators/mnemonic.validator'

@Component({
  selector: 'airgap-seed-xor-import',
  templateUrl: './seed-xor-import.page.html',
  styleUrls: ['./seed-xor-import.page.scss']
})
export class SeedXorImportPage {
  constructor(
    private readonly seedXOR: SeedXorService,
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    public formBuilder: FormBuilder
  ) {
    this.setNumberOfShares(3)
  }

  public numberOfShares: number
  public shares: string[]

  public socialRecoveryForm: FormGroup

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-create' })
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

  public async recover(): Promise<void> {
    try {
      const secretString = await this.seedXOR.combine(this.shares)

      this.navigationService
        .routeWithState('secret-edit', { secret: new MnemonicSecret(secretString, 'Recovery by SeedXOR') })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (error) {
      console.log('oops', error)
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
