import { Injectable } from '@angular/core'
import { NavController } from '@ionic/angular'
// import { InteractionSelectionPage } from '../../pages/interaction-selection/interaction-selection'
// import { WalletSharePage } from '../../pages/wallet-share/wallet-share'
// import { TransactionSignedPage } from '../../pages/transaction-signed/transaction-signed'
import { AirGapWallet, UnsignedTransaction } from 'airgap-coin-lib'

// import { Transaction } from '../../../models/transaction.model'
import { Secret } from '../../models/secret'

import { DeepLinkService } from './../deep-link/deep-link.service'
import { Router } from '@angular/router'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'

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
  signedTx?: string
  wallet?: AirGapWallet
  transaction?: UnsignedTransaction
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  constructor(private readonly router: Router, private readonly deepLinkProvider: DeepLinkService) {}

  public startInteraction(interactionOptions: IInteractionOptions, secret: Secret) {
    console.log('start interaction', interactionOptions, secret)
    const interactionSetting = secret.interactionSetting

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

  private goToInteractionSelectionPage(interactionOptions: IInteractionOptions) {
    console.log('goToInteractionSelectionPage')
    this.router
      .navigateByUrl('/interaction-selection', { state: { interactionOptions } })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private goToInteractionSelectionSettingsPage(interactionOptions: IInteractionOptions) {
    console.log('goToInteractionSelectionSettingsPage')
    this.router
      .navigateByUrl('/interaction-selection-settings', { state: { interactionOptions } })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private navigateToPageByOperationType(interactionOptions: IInteractionOptions) {
    console.log('navigateToPageByOperationType')

    // To ensure exhausting enum
    const assertNever = (arg: never): never => {
      throw new Error('INVALID_OPERATION_TYPE')
    }

    if (interactionOptions.operationType === InteractionOperationType.WALLET_SYNC) {
      this.router
        .navigateByUrl('/account-share', { state: { interactionUrl: interactionOptions.url } })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (interactionOptions.operationType === InteractionOperationType.TRANSACTION_BROADCAST) {
      this.router
        .navigateByUrl('/transaction-signed', {
          state: {
            interactionUrl: interactionOptions.url,
            wallet: interactionOptions.wallet,
            signedTx: interactionOptions.signedTx,
            transaction: interactionOptions.transaction
          }
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      return assertNever(interactionOptions.operationType)
    }
  }

  private startDeeplink(url: string) {
    console.log('startDeeplink')

    this.deepLinkProvider
      .sameDeviceDeeplink(url)
      .then(() => {
        this.router.navigateByUrl('/tabs/tab-account').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.DEEPLINK_PROVIDER))
  }
}
