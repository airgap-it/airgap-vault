import { Component } from '@angular/core'
import { ModalController, AlertController } from '@ionic/angular'
import { ICoinProtocol, MainProtocolSymbols } from '@airgap/coinlib-core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'
import { LocalAuthenticationOnboardingPage } from '../local-authentication-onboarding/local-authentication-onboarding.page'
import { BIP39_PASSPHRASE_ENABLED } from 'src/app/constants/constants'
import { ProtocolService } from '@airgap/angular-core'
import { MnemonicSecret } from 'src/app/models/secret'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface ProtocolWrapper {
  protocol: ICoinProtocol
  isHDWallet: boolean
  isChecked: boolean
  customDerivationPath: string | undefined
}

@Component({
  selector: 'airgap-account-add',
  templateUrl: './account-add.page.html',
  styleUrls: ['./account-add.page.scss']
})
export class AccountAddPage {
  public secret: MnemonicSecret
  public selectedProtocol: ICoinProtocol
  public formValid: boolean = false
  public protocolList: ProtocolWrapper[]
  public isHDWallet: boolean = false

  singleSelectedProtocol: ProtocolWrapper | undefined

  public isAdvancedMode: boolean = false
  public isBip39PassphraseEnabled: boolean = BIP39_PASSPHRASE_ENABLED
  public revealBip39Passphrase: boolean = false
  public bip39Passphrase: string = ''

  public isAppAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly secretsService: SecretsService,
    private readonly storageService: VaultStorageService,
    private readonly protocolService: ProtocolService,
    private readonly modalController: ModalController,
    private readonly navigationService: NavigationService,
    private readonly alertController: AlertController
  ) {
    const state = this.navigationService.getState()
    this.secret = state.secret
    this.protocolService.getActiveProtocols().then((protocols: ICoinProtocol[]) => {
      this.protocolList = protocols.map((protocol) => {
        const isChecked =
          protocol.identifier === MainProtocolSymbols.BTC_SEGWIT ||
          protocol.identifier === MainProtocolSymbols.ETH ||
          this.navigationService.getState().protocol?.identifier === protocol.identifier

        return { protocol, isHDWallet: protocol.supportsHD, customDerivationPath: undefined, isChecked: isChecked }
      })
      this.onProtocolSelected()
    })
  }

  public onProtocolSelected(): void {
    // Wait 1 tick so "isChecked" is updated
    setTimeout(() => {
      const selectedProtocols = this.protocolList.filter((protocol) => protocol.isChecked)
      if (selectedProtocols.length === 0) {
        this.formValid = false
      } else {
        this.formValid = true
      }

      selectedProtocols.forEach((wrapper) => {
        wrapper.customDerivationPath = undefined
      })

      if (selectedProtocols.length === 1) {
        this.singleSelectedProtocol = selectedProtocols[0]
        this.singleSelectedProtocol.customDerivationPath = this.singleSelectedProtocol.protocol.standardDerivationPath
      } else {
        if (this.singleSelectedProtocol) {
          this.singleSelectedProtocol.customDerivationPath = undefined
        }
        this.singleSelectedProtocol = undefined
      }
    }, 0)
  }

  public toggleHDWallet() {
    // "isHDWallet" can only be toggled if one protocol is checked

    const selectedProtocols = this.protocolList.filter((protocol) => protocol.isChecked)
    if (selectedProtocols.length === 1) {
      const selectedProtocol = selectedProtocols[0]
      if (selectedProtocol.protocol.supportsHD && selectedProtocol.isHDWallet) {
        selectedProtocol.customDerivationPath = selectedProtocol.protocol.standardDerivationPath
      } else {
        selectedProtocol.customDerivationPath = `${selectedProtocol.protocol.standardDerivationPath}/0/0`
      }
    }

    if (selectedProtocols.length === 1) {
      this.singleSelectedProtocol = selectedProtocols[0]
    } else {
      this.singleSelectedProtocol = undefined
    }
  }

  public async addWallet(): Promise<void> {
    const value: boolean = await this.storageService.get(VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING)
    if (!value) {
      const modal: HTMLIonModalElement = await this.modalController.create({
        component: LocalAuthenticationOnboardingPage
      })

      modal
        .onDidDismiss()
        .then(() => {
          this.addWalletAndReturnToAddressPage()
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    } else {
      this.addWalletAndReturnToAddressPage()
    }
  }

  private async addWalletAndReturnToAddressPage(): Promise<void> {
    const addAccount = () => {
      this.secretsService
        .addWallets(
          this.secret,
          this.protocolList.map((protocolWrapper: ProtocolWrapper) => {
            const protocol = protocolWrapper.protocol
            return {
              protocolIdentifier: protocol.identifier,
              isHDWallet: protocolWrapper.isChecked ? protocolWrapper.isHDWallet : protocol.supportsHD,
              customDerivationPath:
                protocolWrapper.isChecked && protocolWrapper.customDerivationPath
                  ? protocolWrapper.customDerivationPath
                  : protocol.standardDerivationPath,
              bip39Passphrase: protocolWrapper.isChecked ? this.bip39Passphrase : '',
              isActive: protocolWrapper.isChecked
            }
          })
        )
        .then(() => {
          this.navigationService
            .routeWithState('/accounts-list', { secret: this.secret }, { replaceUrl: true })
            .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    }

    if (this.bip39Passphrase.length > 0) {
      const alert = await this.alertController.create({
        header: 'BIP-39 Passphrase',
        message:
          'You set a BIP-39 Passphrase. You will need to enter this passphrase again when you import your secret. If you lose your passphrase, you will lose access to your account!',
        backdropDismiss: false,
        inputs: [
          {
            name: 'understood',
            type: 'checkbox',
            label: 'I understand',
            value: 'understood',
            checked: false
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Ok',
            handler: async (result: string[]) => {
              if (result.includes('understood')) {
                addAccount()
              }
            }
          }
        ]
      })
      alert.present()
    } else {
      addAccount()
    }
  }
}
