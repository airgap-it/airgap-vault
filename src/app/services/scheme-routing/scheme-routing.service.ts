import { AlertService } from './../alert/alert.service'
import { Injectable } from '@angular/core'
import { AirGapWallet, IACMessageDefinitionObject, IACMessageType, UnsignedTransaction, getProtocolByIdentifier } from 'airgap-coin-lib'

import { SerializerService } from '../../services/serializer/serializer.service'
import { to } from '../../utils/utils'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

export enum IACResult {
  SUCCESS = 0,
  PARTIAL = 1,
  ERROR = 2
}

@Injectable({
  providedIn: 'root'
})
export class SchemeRoutingService {
  private readonly syncSchemeHandlers: {
    [key in IACMessageType]: (deserializedSync: IACMessageDefinitionObject[], scanAgainCallback: Function) => Promise<boolean>
  }

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly alertService: AlertService,
    private readonly serializerService: SerializerService
  ) {
    this.syncSchemeHandlers = {
      [IACMessageType.MetadataRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MetadataResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.AccountShareRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.AccountShareResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.TransactionSignRequest]: this.handleUnsignedTransactions.bind(this),
      [IACMessageType.TransactionSignResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MessageSignRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MessageSignResponse]: this.syncTypeNotSupportedAlert.bind(this)
    }
  }

  public async handleNewSyncRequest(
    data: string | string[],
    scanAgainCallback: Function = (_scanResult: { currentPage: number; totalPageNumber: number }): void => {}
  ): Promise<IACResult> {
    // wait for secrets to be loaded for sure
    await this.secretsService.isReady()

    const [error, deserializedSync]: [Error | null, IACMessageDefinitionObject[] | undefined] = await to(
      this.serializerService.deserialize(data)
    )

    if (error && !error.message) {
      scanAgainCallback(error)

      return IACResult.PARTIAL
    } else if (error && error.message) {
      console.warn('Deserialization of sync failed', error)
      // TODO: Log error locally
      const cancelButton = {
        text: 'tab-wallets.invalid-sync-operation_alert.okay_label',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }
      this.alertService.showTranslatedAlert(
        'tab-wallets.invalid-sync-operation_alert.title',
        'tab-wallets.invalid-sync-operation_alert.text',
        false,
        [cancelButton]
      )

      return IACResult.ERROR
    }
    if (deserializedSync && deserializedSync.length > 0) {
      const groupedByType = deserializedSync.reduce(
        (grouped, message) => Object.assign(grouped, { [message.type]: (grouped[message.type] || []).concat(message) }),
        {}
      )

      for (let type in groupedByType) {
        if (type in IACMessageType) {
          this.syncSchemeHandlers[type](groupedByType[type], scanAgainCallback).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
        } else {
          this.syncTypeNotSupportedAlert(groupedByType[type], scanAgainCallback).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))

          return IACResult.ERROR
        }
      }

      return IACResult.SUCCESS
    } else {
      console.warn('No message found')
      scanAgainCallback()

      return IACResult.ERROR
    }
  }

  private async handleUnsignedTransactions(
    deserializedSyncProtocols: IACMessageDefinitionObject[],
    scanAgainCallback: Function
  ): Promise<boolean> {
    const transactionsWithWallets: [UnsignedTransaction, AirGapWallet][] = deserializedSyncProtocols
      .map((deserializedSyncProtocol) => {
        const unsignedTransaction: UnsignedTransaction = deserializedSyncProtocol.payload as UnsignedTransaction

        let correctWallet = this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
          unsignedTransaction.publicKey,
          deserializedSyncProtocol.protocol
        )

        // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
        // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
        // and fee for all tokens we support.
        if (!correctWallet) {
          const baseWallet: AirGapWallet | undefined = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
            unsignedTransaction.publicKey,
            deserializedSyncProtocol.protocol
          )

          if (baseWallet) {
            // If the protocol is not supported, use the base protocol for signing
            const protocol = getProtocolByIdentifier(deserializedSyncProtocol.protocol)
            try {
              correctWallet = new AirGapWallet(protocol, baseWallet.publicKey, baseWallet.isExtendedPublicKey, baseWallet.derivationPath)
              correctWallet.addresses = baseWallet.addresses
            } catch (e) {
              if (e.message === 'PROTOCOL_NOT_SUPPORTED') {
                correctWallet = baseWallet
              }
            }
          }
        }

        return [unsignedTransaction, correctWallet] as [UnsignedTransaction, AirGapWallet]
      })
      .filter((pair: [UnsignedTransaction, AirGapWallet]) => pair[1])

    if (transactionsWithWallets.length > 0) {
      if (transactionsWithWallets.length !== deserializedSyncProtocols.length) {
        // TODO: probably show error
      }

      this.navigationService
        .routeWithState('transaction-detail', {
          transactionsWithWallets: transactionsWithWallets,
          deserializedSync: deserializedSyncProtocols
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

      return true
    } else {
      const cancelButton = {
        text: 'tab-wallets.no-secret_alert.okay_label',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }
      this.alertService.showTranslatedAlert('tab-wallets.no-secret_alert.title', 'tab-wallets.no-secret_alert.text', false, [cancelButton])

      return false
    }
  }

  private async syncTypeNotSupportedAlert(
    _deserializedSyncProtocols: IACMessageDefinitionObject[],
    scanAgainCallback: Function
  ): Promise<boolean> {
    // TODO: Log error locally
    const cancelButton = {
      text: 'tab-wallets.sync-operation-not-supported_alert.okay_label',
      role: 'cancel',
      handler: () => {
        scanAgainCallback()
      }
    }
    this.alertService.showTranslatedAlert(
      'tab-wallets.sync-operation-not-supported_alert.title',
      'tab-wallets.sync-operation-not-supported_alert.text',
      false,
      [cancelButton]
    )

    return false
  }
}
