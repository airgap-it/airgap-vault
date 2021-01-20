import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { debounceTime } from 'rxjs/operators'

import { BIP39Signer } from '../../models/BIP39Signer'
import { Secret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { MnemonicValidator } from '../../validators/mnemonic.validator'
import { WordlistPage } from '../wordlist/wordlist.page'
import * as bip39 from 'bip39'

@Component({
  selector: 'airgap-secret-import',
  templateUrl: './secret-import.page.html',
  styleUrls: ['./secret-import.page.scss']
})
export class SecretImportPage {
  public mnemonic: string
  public secretImportForm: FormGroup

  public unknownWords: { word: string; position: number }[] = []

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly formBuilder: FormBuilder,
    private readonly modalController: ModalController
  ) {
    const formGroup: {
      [key: string]: any
    } = {
      mnemonic: ['', Validators.compose([Validators.required, MnemonicValidator.isValid])]
    }

    const signer: BIP39Signer = new BIP39Signer()

    this.secretImportForm = this.formBuilder.group(formGroup)
    this.secretImportForm.valueChanges.subscribe((formGroup) => {
      this.mnemonic = formGroup.mnemonic
    })

    this.secretImportForm.valueChanges.pipe(debounceTime(500)).subscribe((formGroup) => {
      this.unknownWords = signer.getUnknownWords(formGroup.mnemonic)
    })
  }

  public async viewWordlist(): Promise<void> {
    const modal = await this.modalController.create({
      component: WordlistPage,
      componentProps: {
        wordlist: bip39.wordlists.english
      }
    })
    return await modal.present()
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-create' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public goToSecretCreatePage(): void {
    const signer: BIP39Signer = new BIP39Signer()

    const secret: Secret = new Secret(signer.mnemonicToEntropy(BIP39Signer.prepareMnemonic(this.mnemonic)))

    this.navigationService
      .routeWithState('secret-edit', { secret, isGenerating: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
