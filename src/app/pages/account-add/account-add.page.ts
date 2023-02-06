import { Component } from '@angular/core'
import { ModalController, AlertController } from '@ionic/angular'
import { ICoinProtocol, ProtocolSymbols } from '@airgap/coinlib-core'

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
  details: ProtocolDetails
}

interface ProtocolDetails {
  symbol: string
  identifier: ProtocolSymbols
  name: string
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
  public protocolDetails: ProtocolDetails[]
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
    this.protocolService.getActiveProtocols().then(async (protocols: ICoinProtocol[]) => {
      const navigationIdentifier: ProtocolSymbols | undefined = state.protocol

      this.protocolList = await Promise.all(protocols.map(async (protocol) => {
        const [symbol, identifier, name, supportsHD] = await Promise.all([
          protocol.getSymbol(),
          protocol.getIdentifier(),
          protocol.getName(),
          protocol.getSupportsHD()
        ])
        const isChecked = navigationIdentifier === identifier

        return {
          protocol,
          isHDWallet: supportsHD,
          customDerivationPath: undefined,
          isChecked: isChecked,
          details: { symbol, identifier, name }
        }
      }))
      this.onProtocolSelected()
    })
  }

  public onProtocolSelected(): void {
    // Wait 1 tick so "isChecked" is updated
    setTimeout(async () => {
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
        this.singleSelectedProtocol.customDerivationPath = await this.singleSelectedProtocol.protocol.getStandardDerivationPath()
      } else {
        if (this.singleSelectedProtocol) {
          this.singleSelectedProtocol.customDerivationPath = undefined
        }
        this.singleSelectedProtocol = undefined
      }
    }, 0)
  }

  public async toggleHDWallet() {
    // "isHDWallet" can only be toggled if one protocol is checked

    const selectedProtocols = this.protocolList.filter((protocol) => protocol.isChecked)
    if (selectedProtocols.length === 1) {
      const selectedProtocol = selectedProtocols[0]
      const standardDerivationPath = await selectedProtocol.protocol.getStandardDerivationPath()
      if (await selectedProtocol.protocol.getSupportsHD() && selectedProtocol.isHDWallet) {
        selectedProtocol.customDerivationPath = standardDerivationPath
      } else {
        selectedProtocol.customDerivationPath = `${standardDerivationPath}/0/0`
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
    const addAccount = async () => {
      this.secretsService
        .addWallets(
          this.secret,
          await Promise.all(this.protocolList.map(async (protocolWrapper: ProtocolWrapper) => {
            const protocol = protocolWrapper.protocol
            return {
              protocolIdentifier: await protocol.getIdentifier(),
              isHDWallet: protocolWrapper.isChecked ? protocolWrapper.isHDWallet : await protocol.getSupportsHD(),
              customDerivationPath:
                protocolWrapper.isChecked && protocolWrapper.customDerivationPath
                  ? protocolWrapper.customDerivationPath
                  : await protocol.getStandardDerivationPath(),
              bip39Passphrase: protocolWrapper.isChecked ? this.bip39Passphrase : '',
              isActive: protocolWrapper.isChecked
            }
          }))
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
