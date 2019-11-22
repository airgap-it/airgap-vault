import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ModalController } from '@ionic/angular'

import { BIP39Signer } from '../../models/BIP39Signer'
import { Secret } from '../../models/secret'
import { SecureBasePage } from '../../secure-base/secure-base.page'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'

@Component({
  selector: 'airgap-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage extends SecureBasePage {
  public mnemonic: string
  public secretImportForm: FormGroup

  constructor(
    deviceProvider: DeviceService,
    modalController: ModalController,
    protected readonly navigationService: NavigationService,
    private readonly formBuilder: FormBuilder
  ) {
    super(navigationService, deviceProvider, modalController)

    const formGroup: {
      [key: string]: any
    } = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    this.secretImportForm = this.formBuilder.group(formGroup)
  }

  public ionViewDidEnter(): void {
    super.ionViewDidEnter()
  }

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
  }

  public goToSecretCreatePage(): void {
    const signer: BIP39Signer = new BIP39Signer()

    const secret: Secret = new Secret(signer.mnemonicToEntropy(BIP39Signer.prepareMnemonic(this.mnemonic)))

    this.navigationService
      .routeWithState('secret-edit', { secret, isGenerating: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
