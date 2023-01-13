import {
  AppConfig,
  APP_CONFIG,
  BaseIACService,
  ClipboardService,
  DeeplinkService,
  IACMessageTransport,
  IACMessageWrapper,
  ProtocolService,
  RelayMessage,
  UiEventElementsService,
  UiEventService
} from '@airgap/angular-core'
import { AirGapWallet, AirGapWalletStatus, MainProtocolSymbols, UnsignedTransaction } from '@airgap/coinlib-core'
import { Inject, Injectable } from '@angular/core'

import { SignTransactionInfo } from '../../models/sign-transaction-info'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'
import * as bitcoinJS from 'bitcoinjs-lib'
import { ModalController } from '@ionic/angular'
import { SelectAccountPage } from 'src/app/pages/select-account/select-account.page'
import { RawBitcoinSegwitTransaction } from '@airgap/bitcoin'
import { IACMessageType, IACMessageDefinitionObjectV3, MessageSignRequest } from '@airgap/serializer'
import { RawTypedEthereumTransaction } from '@airgap/ethereum/v0/types/transaction-ethereum'

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
    private readonly modalController: ModalController,
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
    messageWrapper: IACMessageWrapper<IACMessageDefinitionObjectV3[]>,
    _transport: IACMessageTransport,
    scanAgainCallback: Function
  ): Promise<boolean> {
    const signTransactionRequests: IACMessageDefinitionObjectV3[] = messageWrapper.result

    const transactionInfos: SignTransactionInfo[] = (
      await Promise.all(
        signTransactionRequests.map(async (signTransactionRequest): Promise<SignTransactionInfo> => {
          return this.findMatchingWallet(signTransactionRequest, messageWrapper.context)
        })
      )
    ).filter((signTransactionDetails) => signTransactionDetails.wallet !== undefined)

    if (transactionInfos.length > 0) {
      if (transactionInfos.length !== signTransactionRequests.length) {
        // TODO: probably show error
      }

      this.navigationService
        .routeWithState('deserialized-detail', {
          transactionInfos: transactionInfos,
          iacContext: messageWrapper.context,
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
    messageWrapper: IACMessageWrapper<IACMessageDefinitionObjectV3[]>,
    _transport: IACMessageTransport,
    _scanAgainCallback: Function
  ): Promise<boolean> {
    const messageDefinitionObjects: IACMessageDefinitionObjectV3[] = messageWrapper.result

    const transactionInfos: SignTransactionInfo[] = await Promise.all(
      messageDefinitionObjects.map(async (messageDefinitionObject): Promise<SignTransactionInfo> => {
        return this.findMatchingSignWallet(messageDefinitionObject, messageWrapper.context)
      })
    )
    this.navigationService
      .routeWithState('deserialized-detail', {
        transactionInfos: transactionInfos,
        iacContext: messageWrapper.context,
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

  private async findMatchingWallet(
    signTransactionRequest: IACMessageDefinitionObjectV3,
    metadata: {
      requestId?: string
      derivationPath?: string
      sourceFingerprint?: string
    }
  ) {
    const unsignedTransaction: UnsignedTransaction = signTransactionRequest.payload as UnsignedTransaction

    // Select wallet by public key and protocol identifier
    let correctWallet = await this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
      unsignedTransaction.publicKey,
      signTransactionRequest.protocol
    )

    // If no wallet is found with public key and protocol identifier, it's probably because there is no public key.
    // This can happen if we work with third party wallets that have a different format that doesn't include the public key.

    // BTC: First we try to find a wallet by matching the masterFingerprint
    if (!correctWallet && signTransactionRequest.protocol === MainProtocolSymbols.BTC_SEGWIT) {
      const transaction: RawBitcoinSegwitTransaction = unsignedTransaction.transaction
      const decodedPSBT = bitcoinJS.Psbt.fromHex(transaction.psbt)
      for (const input of decodedPSBT.data.inputs) {
        for (const derivation of input.bip32Derivation) {
          const masterFingerprint = derivation.masterFingerprint.toString('hex')

          correctWallet = await this.secretsService.findWalletByFingerprintDerivationPathAndProtocolIdentifier(
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

      // BTC: If we couldn't find a wallet using the masterFingerprint, it's possible that the masterFingerprint is invalid or a placeholder.
      // This can happen if the watch-only wallet doesn't have that information available. In this case, we need to show an account selection modal.
      if (!correctWallet) {
        await new Promise(async (resolve) => {
          // Start account selection
          const modal = await this.modalController.create({
            component: SelectAccountPage,
            componentProps: { type: 'psbt', symbolFilter: MainProtocolSymbols.BTC_SEGWIT }
          })

          modal
            .onDidDismiss()
            .then((result) => {
              console.log('modal closed', result)
              correctWallet = result.data
              resolve(undefined)
            })
            .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

          modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        })
      }

      if (correctWallet && !unsignedTransaction.publicKey) {
        unsignedTransaction.publicKey = correctWallet.publicKey // PSBT txs don't include a public key, so we need to set it
      }
    }

    // ETH: MetaMask requests don't contain the public key information, we need to do the matching based on the sourceFingerprint
    if (!correctWallet && signTransactionRequest.protocol === MainProtocolSymbols.ETH) {
      const transaction: RawTypedEthereumTransaction = unsignedTransaction.transaction

      const fingerprint = transaction.masterFingerprint ?? metadata.sourceFingerprint
      const derivationPath = transaction.derivationPath ?? metadata.derivationPath

      correctWallet = await this.findMetaMaskWallet(fingerprint, signTransactionRequest.protocol, derivationPath)

      if (correctWallet && !derivationPath.startsWith(correctWallet.derivationPath.slice(2) /* Remove leading "m/" */)) {
        throw new Error('Derivation path of the request does not match the one of the selected wallet')
      }

      if (correctWallet && !unsignedTransaction.publicKey) {
        unsignedTransaction.publicKey = correctWallet.publicKey // MetaMask txs don't include a public key, so we need to set it
      }
    }

    if (correctWallet) {
      await this.activateWallet(correctWallet)
    }

    if (!correctWallet) {
      correctWallet = await this.findBaseWallet(unsignedTransaction.publicKey, signTransactionRequest)
    }

    const secret = this.secretsService.findByPublicKey(correctWallet.publicKey)

    return {
      wallet: correctWallet,
      secret,
      signTransactionRequest
    }
  }

  private async findMatchingSignWallet(
    messageDefinitionObject: IACMessageDefinitionObjectV3,
    metadata: {
      requestId?: string
      derivationPath?: string
      sourceFingerprint?: string
    }
  ) {
    const messageSignRequest: MessageSignRequest = messageDefinitionObject.payload as MessageSignRequest

    let correctWallet = await this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
      messageSignRequest.publicKey,
      messageDefinitionObject.protocol
    )

    // ETH: MetaMask requests don't contain the public key information, we need to do the matching based on the sourceFingerprint
    if (!correctWallet && messageDefinitionObject.protocol === MainProtocolSymbols.ETH) {
      correctWallet = await this.findMetaMaskWallet(metadata.sourceFingerprint, messageDefinitionObject.protocol, metadata.derivationPath)

      if (correctWallet && !metadata.derivationPath.startsWith(correctWallet.derivationPath.slice(2) /* Remove leading "m/" */)) {
        throw new Error('Derivation path of the request does not match the one of the selected wallet')
      }
    }

    if (correctWallet) {
      await this.activateWallet(correctWallet)
    }

    if (!correctWallet) {
      correctWallet = await this.findBaseWallet(messageSignRequest.publicKey, messageDefinitionObject)
    }

    const secret = this.secretsService.findByPublicKey(correctWallet.publicKey)

    return {
      wallet: correctWallet,
      secret,
      signTransactionRequest: {
        ...messageDefinitionObject,
        payload: {
          ...messageSignRequest,
          publicKey: correctWallet?.publicKey ?? '' // ignore public key if no account has been found
        }
      }
    }
  }

  private async findBaseWallet(
    publicKey: string,
    messageDefinitionObject: IACMessageDefinitionObjectV3
  ): Promise<AirGapWallet | undefined> {
    // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
    // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
    // and fee for all tokens we support.
    let correctWallet: AirGapWallet | undefined

    const baseWallet: AirGapWallet | undefined = await this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
      publicKey,
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

    return correctWallet
  }

  private async findMetaMaskWallet(
    fingerprint: string,
    protocol: MainProtocolSymbols,
    derivationPath: string
  ): Promise<AirGapWallet | undefined> {
    let correctWallet: AirGapWallet | undefined

    correctWallet = await this.secretsService.findWalletByXPubFingerprintDerivationPathAndProtocolIdentifier(
      fingerprint,
      protocol,
      derivationPath
    )

    return correctWallet
  }
}
