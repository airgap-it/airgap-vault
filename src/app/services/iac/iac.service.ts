import {
  BaseIACService,
  IACHanderStatus,
  IACMessageTransport,
  ProtocolService,
  SerializerService,
  UiEventElementsService,
  UiEventService
} from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { AirGapWallet, IACMessageDefinitionObject, IACMessageType, UnsignedTransaction } from 'airgap-coin-lib'

import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { IACHistoryService } from '../iac-history/iac-history.service'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'
import { ThresholdService } from '../threshold/threshold.service'

@Injectable({
  providedIn: 'root'
})
export class IACService extends BaseIACService {
  constructor(
    public readonly uiEventService: UiEventService,
    uiEventElementsService: UiEventElementsService,
    serializerService: SerializerService,
    protected readonly iacHistoryService: IACHistoryService,
    private readonly protocolService: ProtocolService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService,
    private readonly thresholdService: ThresholdService
  ) {
    super(uiEventElementsService, serializerService, secretsService.isReady(), [])

    this.serializerMessageHandlers[IACMessageType.TransactionSignRequest] = this.handleUnsignedTransactions.bind(this)
  }

  public async relay(data: string | string[]): Promise<void> {
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: Array.isArray(data) ? data.join(',') : data
      },
      this.secretsService.getActiveSecret()
    )
  }

  public async storeResult(message: string | string[], status: IACHanderStatus, transport: IACMessageTransport): Promise<IACHanderStatus> {
    this.iacHistoryService.add(message, transport, false).catch(console.error)

    return super.storeResult(message, status, transport)
  }

  private async handleUnsignedTransactions(
    _data: string | string[],
    deserializedSyncProtocols: IACMessageDefinitionObject[],
    scanAgainCallback: Function
  ): Promise<boolean> {
    const thresholdResult = await this.thresholdService.checkThreshold(deserializedSyncProtocols)
    if (!thresholdResult.allowed) {
      const cancelButton = {
        text: 'tab-wallets.no-secret_alert.okay_label',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }
      this.uiEventService.showTranslatedAlert({
        header: 'Threshold reached',
        subHeader: 'A threshold limit has been reached. You are not allow to handle this transaction. ',
        message: thresholdResult.message,
        buttons: [cancelButton]
      })

      throw new Error('Threshold check failed')
    } else {
      console.log(`Message doesn't match any limits`)
    }

    const transactionsWithWallets: [UnsignedTransaction, AirGapWallet][] = (
      await Promise.all(
        deserializedSyncProtocols.map(async (deserializedSyncProtocol) => {
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
              const protocol = await this.protocolService.getProtocol(deserializedSyncProtocol.protocol)
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
      )
    ).filter((pair: [UnsignedTransaction, AirGapWallet]) => pair[1])

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
      this.uiEventService.showTranslatedAlert({
        header: 'tab-wallets.no-secret_alert.title',
        message: 'tab-wallets.no-secret_alert.text',
        buttons: [cancelButton]
      })

      return false
    }
  }
}
