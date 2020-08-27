import { BaseIACService, IACHistoryService, ProtocolService, SerializerService, UiEventService } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { IACMessageDefinitionObject, UnsignedTransaction, AirGapWallet, IACMessageType } from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class IACService extends BaseIACService {
  constructor(
    uiEventService: UiEventService,
    serializerService: SerializerService,
    iacHistoryService: IACHistoryService,
    private readonly protocolService: ProtocolService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {
    super(uiEventService, serializerService, iacHistoryService, secretsService.isReady(), [])

    this.serializerMessageHandlers[IACMessageType.TransactionSignRequest] = this.handleUnsignedTransactions.bind(this)
  }

  protected async relay(data: string | string[]): Promise<void> {
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: Array.isArray(data) ? data.join(',') : data
      },
      this.secretsService.getActiveSecret()
    )
  }

  private async handleUnsignedTransactions(
    _data: string | string[],
    deserializedSyncProtocols: IACMessageDefinitionObject[],
    scanAgainCallback: Function
  ): Promise<boolean> {
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
