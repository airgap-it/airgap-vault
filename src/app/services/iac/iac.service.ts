import { BaseIACService, ProtocolService, SerializerService, UiEventService, UiEventElementsService } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { IACMessageDefinitionObject, UnsignedTransaction, AirGapWallet, IACMessageType, MessageSignRequest } from '@airgap/coinlib-core'
import { SignTransactionInfo } from 'src/app/models/sign-transaction-info'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class IACService extends BaseIACService {
  constructor(
    public readonly uiEventService: UiEventService,
    uiEventElementsService: UiEventElementsService,
    serializerService: SerializerService,
    private readonly protocolService: ProtocolService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {
    super(uiEventElementsService, serializerService, secretsService.isReady(), [])

    this.serializerMessageHandlers[IACMessageType.TransactionSignRequest] = this.handleUnsignedTransactions.bind(this)
    this.serializerMessageHandlers[IACMessageType.MessageSignRequest] = this.handleMessageSignRequest.bind(this)
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

  private async handleUnsignedTransactions(
    _data: string | string[],
    signTransactionRequests: IACMessageDefinitionObject[],
    scanAgainCallback: Function
  ): Promise<boolean> {
    const transactionInfos: SignTransactionInfo[] = (
      await Promise.all(
        signTransactionRequests.map(
          async (signTransactionRequest): Promise<SignTransactionInfo> => {
            const unsignedTransaction: UnsignedTransaction = signTransactionRequest.payload as UnsignedTransaction

            let correctWallet = this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
              unsignedTransaction.publicKey,
              signTransactionRequest.protocol
            )

            // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
            // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
            // and fee for all tokens we support.
            if (!correctWallet) {
              const baseWallet: AirGapWallet | undefined = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
                unsignedTransaction.publicKey,
                signTransactionRequest.protocol
              )

              if (baseWallet) {
                // If the protocol is not supported, use the base protocol for signing
                const protocol = await this.protocolService.getProtocol(signTransactionRequest.protocol)
                try {
                  correctWallet = new AirGapWallet(
                    protocol,
                    baseWallet.publicKey,
                    baseWallet.isExtendedPublicKey,
                    baseWallet.derivationPath
                  )
                  correctWallet.addresses = baseWallet.addresses
                } catch (e) {
                  if (e.message === 'PROTOCOL_NOT_SUPPORTED') {
                    correctWallet = baseWallet
                  }
                }
              }
            }

            return {
              wallet: correctWallet,
              signTransactionRequest
            }
          }
        )
      )
    ).filter((signTransactionDetails) => signTransactionDetails.wallet !== undefined)

    if (transactionInfos.length > 0) {
      if (transactionInfos.length !== signTransactionRequests.length) {
        // TODO: probably show error
      }

      this.navigationService
        .routeWithState('deserialized-detail', {
          transactionInfos: transactionInfos,
          type: IACMessageType.TransactionSignRequest
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
  private async handleMessageSignRequest(
    _data: string | string[],
    messageDefinitionObjects: IACMessageDefinitionObject[],
    _scanAgainCallback: Function
  ): Promise<boolean> {
    const transactionInfos: SignTransactionInfo[] = (
      await Promise.all(
        messageDefinitionObjects.map(
          async (messageDefinitionObject): Promise<SignTransactionInfo> => {
            const messageSignRequest: MessageSignRequest = messageDefinitionObject.payload as MessageSignRequest

            let correctWallet = this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
              messageSignRequest.publicKey,
              messageDefinitionObject.protocol
            )

            // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
            // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
            // and fee for all tokens we support.
            if (!correctWallet) {
              const baseWallet: AirGapWallet | undefined = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
                messageSignRequest.publicKey,
                messageDefinitionObject.protocol
              )

              if (baseWallet) {
                // If the protocol is not supported, use the base protocol for signing
                const protocol = await this.protocolService.getProtocol(messageDefinitionObject.protocol)
                try {
                  correctWallet = new AirGapWallet(
                    protocol,
                    baseWallet.publicKey,
                    baseWallet.isExtendedPublicKey,
                    baseWallet.derivationPath
                  )
                  correctWallet.addresses = baseWallet.addresses
                } catch (e) {
                  if (e.message === 'PROTOCOL_NOT_SUPPORTED') {
                    correctWallet = baseWallet
                  }
                }
              }
            }

            return {
              wallet: correctWallet,
              signTransactionRequest: messageDefinitionObject
            }
          }
        )
      )
    ).filter((signTransactionDetails) => signTransactionDetails.wallet !== undefined)

    this.navigationService
      .routeWithState('deserialized-detail', {
        transactionInfos: transactionInfos,
        type: IACMessageType.MessageSignRequest
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

    return true
  }
}
