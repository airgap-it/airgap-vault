import {
  AppConfig,
  APP_CONFIG,
  BaseIACService,
  ClipboardService,
  DeeplinkService,
  IACMessageTransport,
  ProtocolService,
  RelayMessage,
  UiEventElementsService,
  UiEventService
} from '@airgap/angular-core'
import {
  AirGapWallet,
  AirGapWalletStatus,
  IACMessageDefinitionObjectV3,
  IACMessageType,
  MainProtocolSymbols,
  MessageSignRequest,
  UnsignedTransaction
} from '@airgap/coinlib-core'
import { Inject, Injectable } from '@angular/core'

import { SignTransactionInfo } from '../../models/sign-transaction-info'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'
import * as bitcoinJS from 'bitcoinjs-lib'

@Injectable({
  providedIn: 'root'
})
export class IACService extends BaseIACService {
  constructor(
    public readonly uiEventService: UiEventService,
    public readonly uiEventElementsService: UiEventElementsService,
    public readonly deeplinkService: DeeplinkService,
    private readonly protocolService: ProtocolService,
    protected readonly clipboard: ClipboardService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService,
    @Inject(APP_CONFIG) appConfig: AppConfig
  ) {
    super(uiEventElementsService, clipboard, secretsService.isReady(), [], deeplinkService, appConfig)

    this.serializerMessageHandlers[IACMessageType.TransactionSignRequest] = this.handleUnsignedTransactions.bind(this)
    this.serializerMessageHandlers[IACMessageType.MessageSignRequest] = this.handleMessageSignRequest.bind(this)
  }

  public async relay(data: RelayMessage): Promise<void> {
    this.interactionService.startInteraction({
      operationType: InteractionOperationType.WALLET_SYNC,
      iacMessage: (data as any).messages ?? (data as any).rawString // TODO: Fix types
    })
  }

  private async handleUnsignedTransactions(
    signTransactionRequests: IACMessageDefinitionObjectV3[],
    _transport: IACMessageTransport,
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

            if (!correctWallet && signTransactionRequest.protocol === MainProtocolSymbols.BTC_SEGWIT) {
              const decodedPSBT = bitcoinJS.Psbt.fromHex(unsignedTransaction.transaction)
              for (const input of decodedPSBT.data.inputs) {
                for (const derivation of input.bip32Derivation) {
                  const masterFingerprint = derivation.masterFingerprint.toString('hex')

                  correctWallet = this.secretsService.findWalletByFingerprintDerivationPathAndProtocolIdentifier(
                    masterFingerprint,
                    signTransactionRequest.protocol,
                    derivation.path,
                    derivation.pubkey
                  )
                  if (correctWallet) {
                    break
                  }
                }
                if (correctWallet) {
                  break
                }
              }

              if (correctWallet && !unsignedTransaction.publicKey) {
                unsignedTransaction.publicKey = correctWallet.publicKey // PSBT txs don't include a public key, so we need to set it
              }
            }

            if (correctWallet) {
              await this.activateWallet(correctWallet)
            }

            // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
            // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
            // and fee for all tokens we support.
            if (!correctWallet) {
              const baseWallet: AirGapWallet | undefined = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
                unsignedTransaction.publicKey,
                signTransactionRequest.protocol
              )

              if (baseWallet) {
                await this.activateWallet(baseWallet)
                // If the protocol is not supported, use the base protocol for signing
                const protocol = await this.protocolService.getProtocol(signTransactionRequest.protocol)
                try {
                  correctWallet = new AirGapWallet(
                    protocol,
                    baseWallet.publicKey,
                    baseWallet.isExtendedPublicKey,
                    baseWallet.derivationPath,
                    baseWallet.masterFingerprint,
                    baseWallet.status
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
    messageDefinitionObjects: IACMessageDefinitionObjectV3[],
    _transport: IACMessageTransport,
    _scanAgainCallback: Function
  ): Promise<boolean> {
    const transactionInfos: SignTransactionInfo[] = await Promise.all(
      messageDefinitionObjects.map(
        async (messageDefinitionObject): Promise<SignTransactionInfo> => {
          const messageSignRequest: MessageSignRequest = messageDefinitionObject.payload as MessageSignRequest

          let correctWallet = this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
            messageSignRequest.publicKey,
            messageDefinitionObject.protocol
          )

          if (correctWallet) {
            await this.activateWallet(correctWallet)
          }

          // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
          // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
          // and fee for all tokens we support.
          if (!correctWallet) {
            const baseWallet: AirGapWallet | undefined = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
              messageSignRequest.publicKey,
              messageDefinitionObject.protocol
            )

            if (baseWallet) {
              await this.activateWallet(baseWallet)
              // If the protocol is not supported, use the base protocol for signing
              const protocol = await this.protocolService.getProtocol(messageDefinitionObject.protocol)
              try {
                correctWallet = new AirGapWallet(
                  protocol,
                  baseWallet.publicKey,
                  baseWallet.isExtendedPublicKey,
                  baseWallet.derivationPath,
                  baseWallet.masterFingerprint,
                  baseWallet.status
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
            signTransactionRequest: {
              ...messageDefinitionObject,
              payload: {
                ...messageSignRequest,
                publicKey: correctWallet?.publicKey ?? '' // ignore public key if no account has been found
              }
            }
          }
        }
      )
    )

    this.navigationService
      .routeWithState('deserialized-detail', {
        transactionInfos: transactionInfos,
        type: IACMessageType.MessageSignRequest
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

    return true
  }

  private async activateWallet(wallet: AirGapWallet): Promise<void> {
    if (wallet.status === AirGapWalletStatus.ACTIVE) {
      return
    }

    wallet.status = AirGapWalletStatus.ACTIVE
    await this.secretsService.updateWallet(wallet)
  }
}
