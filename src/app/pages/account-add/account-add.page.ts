import { Component } from '@angular/core'
import { ModalController, AlertController } from '@ionic/angular'
import { AirGapWalletStatus, ICoinProtocol, MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core'

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
  }

  public ionViewWillEnter(): void {
    const state = this.navigationService.getState()
    this.protocolService.getActiveProtocols().then(async (protocols: ICoinProtocol[]) => {
      const navigationIdentifier: ProtocolSymbols | undefined = state.protocol

      this.protocolList = await Promise.all(
        protocols.map(async (protocol) => {
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
        })
      )
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

  private async getDerivationPath(protocolWrapper: ProtocolWrapper): Promise<string> {
    const selectedProtocol = this.protocolList.filter((protocol) => protocol.isChecked)
    const selectedProtocolIdentifier = await selectedProtocol[0].protocol.getIdentifier()

    if (
      selectedProtocol.length === 1 &&
      (await protocolWrapper.protocol.getIdentifier()) === selectedProtocolIdentifier &&
      !this.isAdvancedMode
    ) {
      const promises = this.secret?.wallets.map(async (wallet) => {
        const walletIdentifier = await wallet.protocol.getIdentifier()

        return {
          value: wallet,
          isActiveWalletAndMatch: wallet.status === AirGapWalletStatus.ACTIVE && selectedProtocolIdentifier === walletIdentifier
        }
      })

      const dataWithInclude = await Promise.all(promises)

      let matchingWallets = dataWithInclude.filter((wallet) => wallet.isActiveWalletAndMatch)

      if (matchingWallets.length === 0) {
        return await selectedProtocol[0].protocol.getStandardDerivationPath()
      }

      let lastDigit: number = -1
      let newDerivationPath: string
      const regex = /(\d+)(?!.*\d)/
      const regex2 = /^(.*?\/.*?\/.*?\/[^\d]*)(\d+)(.*)$/
      let match: string[]

      matchingWallets.forEach((wallet) => {
        if (
          selectedProtocolIdentifier == MainProtocolSymbols.XTZ ||
          selectedProtocolIdentifier == MainProtocolSymbols.XTZ_SHIELDED ||
          selectedProtocolIdentifier == MainProtocolSymbols.AE
        ) {
          const match = wallet.value.derivationPath.match(regex2)

          if (match) {
            const newDigit = parseInt(match[2], 10)

            if (newDigit > lastDigit) {
              const incrementedNumber = newDigit + 1
              newDerivationPath = wallet.value.derivationPath.replace(regex2, `${match[1]}${incrementedNumber}${match[3]}`)

              console.log(newDerivationPath, 'newDerivationPath')

              lastDigit = newDigit
            }
          }
        } else {
          match = wallet.value.derivationPath.match(regex)
          console.log(match, 'match')
          const newDigit = parseInt(match[0], 10)

          if (newDigit > lastDigit) {
            const incrementedNumber = newDigit + 1
            newDerivationPath = wallet.value.derivationPath.replace(regex, incrementedNumber.toString())

            console.log(newDerivationPath, 'newDerivationPath')

            lastDigit = newDigit
          }
        }
      })

      console.log(newDerivationPath, 'path')
      return newDerivationPath
    } else {
      return protocolWrapper.isChecked && protocolWrapper.customDerivationPath
        ? protocolWrapper.customDerivationPath
        : await protocolWrapper.protocol.getStandardDerivationPath()
    }
  }

  public async toggleHDWallet() {
    // "isHDWallet" can only be toggled if one protocol is checked

    const selectedProtocols = this.protocolList.filter((protocol) => protocol.isChecked)
    if (selectedProtocols.length === 1) {
      const selectedProtocol = selectedProtocols[0]
      const standardDerivationPath = await selectedProtocol.protocol.getStandardDerivationPath()
      if ((await selectedProtocol.protocol.getSupportsHD()) && selectedProtocol.isHDWallet) {
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
    const selectedProtocol = this.protocolList.filter((protocol) => protocol.isChecked)
    let derivationPath: string

    let addAccount = async () => {
      this.secretsService
        .addWallets(
          this.secret,
          await Promise.all(
            this.protocolList.map(async (protocolWrapper: ProtocolWrapper) => {
              const protocol = protocolWrapper.protocol
              derivationPath = await this.getDerivationPath(protocolWrapper)

              return {
                protocolIdentifier: await protocol.getIdentifier(),
                isHDWallet: protocolWrapper.isChecked ? protocolWrapper.isHDWallet : await protocol.getSupportsHD(),
                customDerivationPath: derivationPath,
                bip39Passphrase: protocolWrapper.isChecked ? this.bip39Passphrase : '',
                isActive: protocolWrapper.isChecked
              }
            })
          )
        )
        .then(() => {
          if (selectedProtocol.length === 1) {
            let newWallet = this.secret.wallets.filter(
              (wallet) => wallet.derivationPath === derivationPath && wallet.status === AirGapWalletStatus.ACTIVE
            )

            this.navigationService
              .routeWithState('/account-address', { wallet: newWallet[newWallet.length - 1], secret: this.secret })
              .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          } else {
            this.navigationService
              .routeWithState('/accounts-list', { secret: this.secret }, { replaceUrl: true })
              .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          }
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
                await addAccount()
              }
            }
          }
        ]
      })
      alert.present()
    } else {
      await addAccount()
    }
  }
}
