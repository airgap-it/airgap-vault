import { IACHistoryService, IACMessageTransport } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { AirGapWallet, UnsignedTransaction } from 'airgap-coin-lib'

import { Secret } from '../../models/secret'
import { assertNever } from '../../utils/utils'
import { DeepLinkService } from '../deep-link/deep-link.service'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'

export enum InteractionSetting {
  UNDETERMINED = 'undetermined',
  ALWAYS_ASK = 'always',
  SAME_DEVICE = 'same_device',
  OFFLINE_DEVICE = 'offline_device'
}

export enum InteractionCommunicationType {
  QR = 'qr',
  DEEPLINK = 'deeplink'
}

export enum InteractionOperationType {
  WALLET_SYNC = 'walletSync',
  TRANSACTION_BROADCAST = 'transactionBroadcast'
}

export interface IInteractionOptions {
  operationType: InteractionOperationType
  url: string
  communicationType?: InteractionCommunicationType
  signedTxs?: string[]
  wallets?: AirGapWallet[]
  transactions?: UnsignedTransaction[]
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  constructor(
    private readonly navigationService: NavigationService,
    private readonly deepLinkService: DeepLinkService,
    private readonly iacHistoryService: IACHistoryService
  ) {}

  public startInteraction(interactionOptions: IInteractionOptions, secret: Secret): void {
    const interactionSetting: InteractionSetting = secret.interactionSetting

    if (interactionOptions.communicationType) {
      if (interactionSetting === InteractionSetting.UNDETERMINED) {
        this.goToInteractionSelectionSettingsPage(interactionOptions)
      }
      if (interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK) {
        this.startDeeplink(interactionOptions.url)
      } else if (interactionOptions.communicationType === InteractionCommunicationType.QR) {
        this.navigateToPageByOperationType(interactionOptions)
      }
    } else {
      switch (interactionSetting) {
        case InteractionSetting.UNDETERMINED:
          this.goToInteractionSelectionPage(interactionOptions)
          break
        case InteractionSetting.ALWAYS_ASK:
          this.goToInteractionSelectionPage(interactionOptions)
          break
        case InteractionSetting.SAME_DEVICE:
          this.startDeeplink(interactionOptions.url)
          break
        case InteractionSetting.OFFLINE_DEVICE:
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
    this.iacHistoryService.add(interactionOptions.url, IACMessageTransport.QR_SCANNER, true)
    if (interactionOptions.operationType === InteractionOperationType.WALLET_SYNC) {
      this.navigationService
        .routeWithState('/account-share', { interactionUrl: interactionOptions.url })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (interactionOptions.operationType === InteractionOperationType.TRANSACTION_BROADCAST) {
      this.navigationService
        .routeWithState('/transaction-signed', {
          interactionUrl: interactionOptions.url,
          wallets: interactionOptions.wallets,
          signedTxs: interactionOptions.signedTxs,
          transactions: interactionOptions.transactions
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      return assertNever('INVALID_OPERATION_TYPE', interactionOptions.operationType)
    }
  }

  private startDeeplink(url: string): void {
    this.iacHistoryService.add(url, IACMessageTransport.DEEPLINK, true)
    this.deepLinkService
      .sameDeviceDeeplink(url)
      .then(() => {
        this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.DEEPLINK_SERVICE))
  }
}
