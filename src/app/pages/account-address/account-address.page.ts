import { ClipboardService, DeeplinkService, QRType, UiEventService } from '@airgap/angular-core'
import { AirGapWallet, MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { IonModal, PopoverController } from '@ionic/angular'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { MnemonicSecret } from 'src/app/models/secret'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { MigrationService } from '../../services/migration/migration.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'
import { isWalletMigrated } from '../../utils/migration'

import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'

// TODO: add wallet definition into a service
export const airgapwallet = {
  icon: 'airgap-wallet-app-logo.svg',
  name: 'AirGap Wallet',
  qrType: QRType.V3
}

const bluewallet = {
  icon: 'bluewallet.png',
  name: 'BlueWallet',
  qrType: QRType.BC_UR
}

const sparrowwallet = {
  icon: 'sparrowwallet.png',
  name: 'Sparrow Wallet',
  qrType: QRType.BC_UR
}

const specterwallet = {
  icon: 'specterwallet.png',
  name: 'Specter Wallet',
  qrType: QRType.BC_UR
}

const nunchukwallet = {
  icon: 'nunchuk.png',
  name: 'Nunchuk Wallet',
  qrType: QRType.BC_UR
}

const metamask = {
  icon: 'metamask.webp',
  name: 'MetaMask',
  qrType: QRType.METAMASK
}

const imtoken = {
  icon: 'imtoken-wallet.svg',
  name: 'imToken',
  qrType: QRType.METAMASK
}

const rabby = {
  icon: 'rabby-wallet.svg',
  name: 'Rabby',
  qrType: QRType.METAMASK
}

export const superherowallet = {
  icon: 'superhero-wallet.png',
  name: 'Superhero Wallet',
  qrType: QRType.V3,
  urlScheme: 'superhero'
}

export interface CompanionApp {
  icon: string
  name: string
  qrType: QRType
  urlScheme?: string
}

@Component({
  selector: 'airgap-account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss']
})
export class AccountAddressPage {
  @ViewChild(IonModal) modal: IonModal

  public wallet: AirGapWallet
  public protocolSymbol: string
  public protocolIdentifier: ProtocolSymbols
  public protocolName: string
  public secret: MnemonicSecret

  public syncOptions: CompanionApp[]

  public showMetaMaskMigrationOnboarding: boolean = false

  public isAppAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  private shareObject?: IACMessageDefinitionObjectV3[]
  private shareObjectPromise?: Promise<void>
  private walletShareUrl?: string

  presentingElement = null

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly clipboardService: ClipboardService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService,
    private readonly uiEventService: UiEventService,
    private readonly migrationService: MigrationService,
    private readonly deepLinkService: DeeplinkService,
    private readonly storageService: VaultStorageService,
    private readonly router: Router
  ) {
    this.wallet = this.navigationService.getState().wallet
    this.secret = this.navigationService.getState().secret

    if (!this.wallet) {
      this.router.navigate(['/'])
      throw new Error('[AccountAddressPage]: No wallet found! Navigating to home page.')
    }
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page')

    if (this.wallet) {
      const [protocolSymbol, protocolIdentifier, protocolName] = await Promise.all([
        this.wallet.protocol.getSymbol(),
        this.wallet.protocol.getIdentifier(),
        this.wallet.protocol.getName()
      ])

      this.protocolSymbol = protocolSymbol
      this.protocolIdentifier = protocolIdentifier
      this.protocolName = protocolName

      switch (protocolIdentifier) {
        case MainProtocolSymbols.BTC_SEGWIT:
          this.syncOptions = [airgapwallet, bluewallet, sparrowwallet, specterwallet, nunchukwallet]
          break
        case MainProtocolSymbols.BTC_TAPROOT:
          this.syncOptions = [airgapwallet, sparrowwallet]
          break
        case MainProtocolSymbols.ETH:
        case MainProtocolSymbols.OPTIMISM:
          this.syncOptions = [airgapwallet]
          if (this.wallet.isExtendedPublicKey) {
            this.syncOptions.push(metamask, imtoken, rabby)
          } else {
            this.showMetaMaskMigrationOnboarding = true
          }
          break
        case MainProtocolSymbols.AE:
          this.syncOptions = [airgapwallet, superherowallet]
          break

        default:
          this.syncOptions = [airgapwallet]
      }
    }
  }

  public done(): void {
    this.navigationService.routeWithState('/accounts-list', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async share(companionApp: CompanionApp = airgapwallet): Promise<void> {
    await this.waitWalletShareUrl()

    this.interactionService.startInteraction({
      operationType: InteractionOperationType.WALLET_SYNC,
      iacMessage: this.shareObject,
      companionApp: companionApp
    })
  }

  public async presentEditPopover(event: Event): Promise<void> {
    const popover: HTMLIonPopoverElement = await this.popoverCtrl.create({
      component: AccountEditPopoverComponent,
      componentProps: {
        wallet: this.wallet,
        openAddressQR: () => {
          this.modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        },
        getWalletShareUrl: async () => {
          await this.waitWalletShareUrl()
          return this.walletShareUrl
        },
        onDelete: (): void => {
          this.navigationService.back()
        }
      },
      event,
      translucent: true
    })
    return popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(this.wallet.receivingPublicAddress)
  }

  private async waitWalletShareUrl() {
    await this.prepareSyncObject()
    this.walletShareUrl = await this.deepLinkService.generateDeepLinkUrl(this.shareObject)
  }

  private async prepareSyncObject(): Promise<void> {
    if (this.shareObject !== undefined) {
      return
    }

    await this.migrationService.runWalletsMigration([this.wallet])
    if (!isWalletMigrated(this.wallet)) {
      await this.showWalletNotMigratedAlert()

      return Promise.reject('Cannot create share URL, wallet data is incomplete')
    }

    if (this.shareObjectPromise === undefined) {
      this.shareObjectPromise = new Promise<IACMessageDefinitionObjectV3[]>(async (resolve) => {
        const shareObject: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareWalletURL(this.wallet)
        resolve(shareObject)
      }).then((shareObject: IACMessageDefinitionObjectV3[]) => {
        this.shareObject = shareObject
        this.shareObjectPromise = undefined
      })
    }

    return this.shareObjectPromise
  }

  private async showWalletNotMigratedAlert(): Promise<void> {
    return this.uiEventService.showTranslatedAlert({
      header: 'wallet-address.alert.wallet-not-migrated.header',
      message: 'wallet-address.alert.wallet-not-migrated.message',
      buttons: [
        {
          text: 'wallet-address.alert.wallet-not-migrated.button_label'
        }
      ]
    })
  }
}
