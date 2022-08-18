import { DeeplinkService, QRType } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { AirGapWallet, UnsignedTransaction, MessageSignResponse, IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'

import { assertNever } from '../../utils/utils'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { InteractionType, VaultStorageKey, VaultStorageService } from '../storage/storage.service'

export enum InteractionCommunicationType {
  QR = 'qr',
  DEEPLINK = 'deeplink'
}

export enum InteractionOperationType {
  WALLET_SYNC = 'walletSync',
  TRANSACTION_BROADCAST = 'transactionBroadcast',
  MESSAGE_SIGN_REQUEST = 'messageSignRequest'
}

export interface IInteractionOptions {
  operationType: InteractionOperationType
  iacMessage: IACMessageDefinitionObjectV3[] // remove string
  communicationType?: InteractionCommunicationType
  signedTxs?: string[]
  wallets?: AirGapWallet[]
  transactions?: UnsignedTransaction[]
  messageSignResponse?: MessageSignResponse
  qrFormatPreference?: QRType
  walletName?: string
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  constructor(
    private readonly navigationService: NavigationService,
    private readonly deepLinkService: DeeplinkService,
    private readonly storageService: VaultStorageService
  ) {}

  public async startInteraction(interactionOptions: IInteractionOptions): Promise<void> {
    const interactionType = await this.storageService.get(VaultStorageKey.INTERACTION_TYPE)

    if (interactionOptions.communicationType) {
      if (interactionType === InteractionType.UNDETERMINED) {
        this.goToInteractionSelectionSettingsPage(interactionOptions)
      }
      if (interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK) {
        this.startDeeplink(interactionOptions.iacMessage)
      } else if (interactionOptions.communicationType === InteractionCommunicationType.QR) {
        this.navigateToPageByOperationType(interactionOptions)
      }
    } else {
      switch (interactionType) {
        case InteractionType.UNDETERMINED:
          this.goToInteractionSelectionPage(interactionOptions)
          break
        case InteractionType.ALWAYS_ASK:
          this.goToInteractionSelectionPage(interactionOptions)
          break
        case InteractionType.DEEPLINK:
          this.startDeeplink(interactionOptions.iacMessage)
          break
        case InteractionType.QR_CODE:
          this.navigateToPageByOperationType(interactionOptions)
          break
        default:
      }
    }
  }

  private goToInteractionSelectionPage(interactionOptions: IInteractionOptions): void {
    this.navigationService
      .routeWithState('/interaction-selection', { interactionOptions })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions): void {
    this.navigationService
      .routeWithState('/interaction-selection-settings', { interactionOptions })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private navigateToPageByOperationType(interactionOptions: IInteractionOptions): void {
    if (interactionOptions.operationType === InteractionOperationType.WALLET_SYNC) {
      this.navigationService
        .routeWithState('/account-share', {
          interactionUrl: interactionOptions.iacMessage,
          qrFormatPreference: interactionOptions.qrFormatPreference,
          walletName: interactionOptions.walletName
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (interactionOptions.operationType === InteractionOperationType.TRANSACTION_BROADCAST) {
      this.navigationService
        .routeWithState('/transaction-signed', {
          interactionUrl: interactionOptions.iacMessage,
          wallets: interactionOptions.wallets,
          signedTxs: interactionOptions.signedTxs,
          transactions: interactionOptions.transactions,
          translationKey: 'transaction-signed'
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (interactionOptions.operationType === InteractionOperationType.MESSAGE_SIGN_REQUEST) {
      this.navigationService
        .routeWithState('/transaction-signed', {
          interactionUrl: interactionOptions.iacMessage,
          translationKey: 'message-signing-request',
          messageSignResponse: interactionOptions.messageSignResponse
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      return assertNever('INVALID_OPERATION_TYPE', interactionOptions.operationType)
    }
  }

  private async startDeeplink(iacMessage: IACMessageDefinitionObjectV3[]): Promise<void> {
    this.deepLinkService
      .sameDeviceDeeplink(iacMessage)
      .then(() => {
        this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.DEEPLINK_SERVICE))
  }
}
