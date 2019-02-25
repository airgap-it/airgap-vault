import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { NavController } from 'ionic-angular'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler'
import { InteractionSelectionPage } from '../../pages/interaction-selection/interaction-selection'
import { DeepLinkProvider } from '../deep-link/deep-link'
import { WalletSharePage } from '../../pages/wallet-share/wallet-share'
import { TransactionSignedPage } from '../../pages/transaction-signed/transaction-signed'
import { AirGapWallet, UnsignedTransaction } from 'airgap-coin-lib'
import { Transaction } from '../../models/transaction.model'
import { Secret } from '../../models/secret'

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

@Injectable()
export class InteractionProvider {
  constructor(private deepLinkProvider: DeepLinkProvider) {}

  public startInteraction(navCtrl: NavController, interactionOptions: IInteractionOptions, secret: Secret) {
    const interactionSetting = secret.interactionSetting

    console.log('starting interaction', secret, interactionOptions)

    if (interactionOptions.communicationType) {
      if (interactionSetting === InteractionSetting.UNDETERMINED) {
        this.goToInteractionSelectionSettingsPage(navCtrl, interactionOptions)
      }
      if (interactionOptions.communicationType === InteractionCommunicationType.DEEPLINK) {
        this.startDeeplink(interactionOptions.url, navCtrl)
      } else if (interactionOptions.communicationType === InteractionCommunicationType.QR) {
        this.navigateToPageByOperationType(navCtrl, interactionOptions)
      }
    } else {
      switch (interactionSetting) {
        case InteractionSetting.UNDETERMINED:
          this.goToInteractionSelectionPage(navCtrl, interactionOptions)
          break
        case InteractionSetting.ALWAYS_ASK:
          this.goToInteractionSelectionPage(navCtrl, interactionOptions)
          break
        case InteractionSetting.SAME_DEVICE:
          this.startDeeplink(interactionOptions.url, navCtrl)
          break
        case InteractionSetting.OFFLINE_DEVICE:
          this.navigateToPageByOperationType(navCtrl, interactionOptions)
          break
      }
    }
  }

  private goToInteractionSelectionPage(navCtrl: NavController, interactionOptions: IInteractionOptions) {
    navCtrl
      .push('InteractionSelectionPage', {
        interactionOptions: interactionOptions
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private goToInteractionSelectionSettingsPage(navCtrl: NavController, interactionOptions: IInteractionOptions) {
    navCtrl
      .push('InteractionSelectionSettingsPage', {
        interactionOptions: interactionOptions
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private navigateToPageByOperationType(navCtrl: NavController, interactionOptions: IInteractionOptions) {
    // To ensure exhausting enum
    const assertNever = (arg: never): never => {
      throw 'INVALID_OPERATION_TYPE'
    }

    if (interactionOptions.operationType === InteractionOperationType.WALLET_SYNC) {
      navCtrl.push(WalletSharePage, { interactionUrl: interactionOptions.url }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (interactionOptions.operationType === InteractionOperationType.TRANSACTION_BROADCAST) {
      navCtrl
        .push(TransactionSignedPage, {
          interactionUrl: interactionOptions.url,
          wallet: interactionOptions.wallet,
          signedTx: interactionOptions.signedTx,
          transaction: interactionOptions.transaction
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else {
      return assertNever(interactionOptions.operationType)
    }
  }

  private startDeeplink(url: string, navController: NavController) {
    this.deepLinkProvider
      .sameDeviceDeeplink(url)
      .then(() => {
        navController.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.DEEPLINK_PROVIDER))
  }
}
