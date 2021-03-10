import {
  assertNever,
  flattenAirGapTxAddresses,
  KeyPairService,
  ProtocolService,
  SerializerService,
  sumAirGapTxValues,
  TransactionService
} from '@airgap/angular-core'
import {
  AirGapWallet,
  IACMessageDefinitionObject,
  IACMessageType,
  IAirGapTransaction,
  ICoinProtocol,
  MainProtocolSymbols,
  MessageSignRequest,
  ProtocolSymbols,
  SignedTransaction,
  TezosCryptoClient,
  UnsignedTransaction
} from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { TranslateService } from '@ngx-translate/core'
import * as bip39 from 'bip39'
import { from, Observable } from 'rxjs'
import { concatMap, first, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { Secret } from '../../models/secret'
import { SignTransactionInfo } from '../../models/sign-transaction-info'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

import * as actions from './deserialized-detail.actions'
import * as fromDeserializedDetail from './deserialized-detail.reducer'
import {
  DeserializedSignedMessage,
  DeserializedSignedTransaction,
  DeserializedUnsignedMessage,
  DeserializedUnsignedTransaction,
  Mode,
  Payload
} from './deserialized.detail.types'

@Injectable()
export class DeserializedDetailEffects {
  public navigationData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.viewInitialization),
      switchMap(
        () =>
          new Observable<Action>((subscriber) => {
            subscriber.next(actions.navigationDataLoading())
            from(this.loadNavigationData()).pipe(first()).subscribe(subscriber)
          })
      )
    )
  )

  public approved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approved, actions.bip39PassphraseProvided, actions.signingProtocolProvided),
      concatMap((action) => from([action]).pipe(withLatestFrom(this.store.select(fromDeserializedDetail.selectFinalPayload)))),
      switchMap(([action, payload]) => {
        const userInput = {
          bip39Passphrase: 'passphrase' in action ? action.passphrase : undefined,
          protocol: 'protocol' in action ? action.protocol : undefined
        }

        return new Observable<Action>((subscriber) => {
          subscriber.next(actions.runningBlockingTask())
          from(this.handlePayload(payload, userInput)).pipe(first()).subscribe(subscriber)
        })
      })
    )
  )

  public navigateWithSignedTransactions$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.transactionsSigned),
        tap((action) => this.navigateWithSignedTransactions(action.transactions))
      ),
    { dispatch: false }
  )

  public navigateWithSignedMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.messagesSigned),
        tap((action) => this.navigateWithSignedMessages(action.messages))
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromDeserializedDetail.State>,
    private readonly navigationService: NavigationService,
    private readonly translateService: TranslateService,
    private readonly protocolService: ProtocolService,
    private readonly secretsService: SecretsService,
    private readonly keyPairService: KeyPairService,
    private readonly transactionService: TransactionService,
    private readonly serializerService: SerializerService,
    private readonly interactionService: InteractionService
  ) {}

  private async loadNavigationData(): Promise<Action> {
    const state = this.navigationService.getState()
    const [, messageType]: [string | undefined, string | undefined] = this.getPageTypes(state.type)
    const mode: Mode | undefined = this.getMode(state.type)

    if (messageType !== undefined && mode !== undefined && state.transactionInfos !== undefined) {
      const title: string = this.translateService.instant(`deserialized-detail.${messageType}.title`)
      const button: string = this.translateService.instant(`deserialized-detail.${messageType}.button_label`)
      const raw: string = this.signTransactionInfoToRaw(state.transactionInfos)
      try {
        const [transactions, messages]: [DeserializedUnsignedTransaction[], DeserializedUnsignedMessage[]] = await Promise.all([
          this.signTransactionInfoToUnsignedTransactions(state.transactionInfos),
          this.signTransactionInfoToUnsignedMessages(state.transactionInfos)
        ])

        return actions.navigationDataLoaded({ mode, title, button, transactions, messages, raw })
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.warn(error)

        return actions.navigationDataLoadingError({ mode, title, button, raw })
      }
    } else {
      return actions.invalidData()
    }
  }

  private getPageTypes(iacMessageType: IACMessageType | undefined): [string | undefined, string | undefined] {
    let actionType: string | undefined
    if (iacMessageType === IACMessageType.TransactionSignRequest || iacMessageType === IACMessageType.MessageSignRequest) {
      actionType = 'request'
    } else if (iacMessageType === IACMessageType.TransactionSignResponse || iacMessageType === IACMessageType.MessageSignResponse) {
      actionType = 'response'
    }

    let messageType: string | undefined
    if (iacMessageType === IACMessageType.TransactionSignRequest || iacMessageType === IACMessageType.TransactionSignResponse) {
      messageType = 'transaction'
    } else if (iacMessageType === IACMessageType.MessageSignRequest || iacMessageType === IACMessageType.MessageSignResponse) {
      messageType = 'message'
    }

    return [actionType, messageType]
  }

  private getMode(iacMessageType: IACMessageType | undefined): Mode | undefined {
    switch (iacMessageType) {
      case IACMessageType.TransactionSignRequest:
        return Mode.SIGN_TRANSACTION
      case IACMessageType.MessageSignRequest:
        return Mode.SIGN_MESSAGE
      default:
        return undefined
    }
  }

  private signTransactionInfoToRaw(transactionInfo: SignTransactionInfo[]): string {
    const transactions: unknown[] = transactionInfo.map((info: SignTransactionInfo): unknown => {
      switch (info.signTransactionRequest.type) {
        case IACMessageType.TransactionSignRequest:
          return (info.signTransactionRequest.payload as UnsignedTransaction).transaction
        case IACMessageType.TransactionSignResponse:
          return (info.signTransactionRequest.payload as SignedTransaction).transaction
        default:
          return info.signTransactionRequest.payload
      }
    })
    const toStringify: unknown | unknown[] = transactions.length > 1 ? transactions : transactions[0]

    return JSON.stringify(toStringify)
  }

  private async signTransactionInfoToUnsignedTransactions(
    transactionInfo: SignTransactionInfo[]
  ): Promise<DeserializedUnsignedTransaction[]> {
    return Promise.all(
      transactionInfo
        .map((info: SignTransactionInfo): [AirGapWallet, IACMessageDefinitionObject] => [info.wallet, info.signTransactionRequest])
        .filter(
          ([_, request]: [AirGapWallet, IACMessageDefinitionObject]): boolean => request.type === IACMessageType.TransactionSignRequest
        )
        .map(
          async ([wallet, request]: [AirGapWallet, IACMessageDefinitionObject]): Promise<DeserializedUnsignedTransaction> => {
            const details: IAirGapTransaction[] = await this.transactionService.getDetailsFromIACMessages([request])

            return {
              type: 'unsigned',
              id: request.id,
              details,
              data: request.payload as UnsignedTransaction,
              wallet
            }
          }
        )
    )
  }

  private async signTransactionInfoToUnsignedMessages(transactionInfo: SignTransactionInfo[]): Promise<DeserializedUnsignedMessage[]> {
    return Promise.all(
      transactionInfo
        .map((info: SignTransactionInfo): [AirGapWallet, IACMessageDefinitionObject] => [info.wallet, info.signTransactionRequest])
        .filter(([_, request]: [AirGapWallet, IACMessageDefinitionObject]): boolean => request.type === IACMessageType.MessageSignRequest)
        .map(
          async ([wallet, request]: [AirGapWallet, IACMessageDefinitionObject]): Promise<DeserializedUnsignedMessage> => {
            const data: MessageSignRequest = request.payload as MessageSignRequest

            let blake2bHash: string | undefined
            if (request.protocol === MainProtocolSymbols.XTZ) {
              const cryptoClient = new TezosCryptoClient()
              blake2bHash = await cryptoClient.blake2bLedgerHash(data.message)
            }
            
            return {
              type: 'unsigned',
              id: request.id,
              protocol: request.protocol,
              data,
              blake2bHash,
              wallet
            }
          }
        )
    )
  }

  private async handlePayload(payload: Payload, userInput: { bip39Passphrase?: string; protocol?: ProtocolSymbols }): Promise<Action> {
    switch (payload.mode) {
      case Mode.SIGN_TRANSACTION:
        return this.signTransactions(payload.data, userInput.bip39Passphrase)
      case Mode.SIGN_MESSAGE:
        return this.signMessages(payload.data, userInput.bip39Passphrase, userInput.protocol)
      default:
        assertNever('handlePayload', payload)
    }
  }

  private async signTransactions(unsignedTransactions: DeserializedUnsignedTransaction[], bip39Passphrase: string = ''): Promise<Action> {
    try {
      const signedTransactions: DeserializedSignedTransaction[] = await Promise.all(
        unsignedTransactions.map(
          async (transaction: DeserializedUnsignedTransaction): Promise<DeserializedSignedTransaction> => {
            const signed: string = await this.signTransaction(transaction.wallet, transaction.data, bip39Passphrase)

            return {
              type: 'signed',
              id: transaction.id,
              details: transaction.details,
              data: {
                accountIdentifier: transaction.wallet.publicKey.substr(-6),
                transaction: signed,
                callbackURL: transaction.data.callbackURL
              },
              wallet: transaction.wallet
            }
          }
        )
      )

      return actions.transactionsSigned({ transactions: signedTransactions })
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.warn(error)

      if (error.message?.toLowerCase().startsWith('secret not found')) {
        return actions.secretNotFound()
      } else if (error.message?.toLowerCase().startsWith('invalid bip-39 passphrase')) {
        return actions.invalidBip39Passphrase()
      }

      return actions.unknownError({ message: typeof error === 'string' ? error : error.message })
    }
  }

  private async signTransaction(wallet: AirGapWallet, transaction: UnsignedTransaction, bip39Passphrase: string): Promise<string> {
    const secret: Secret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      throw new Error('Secret not found')
    }

    const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = bip39.entropyToMnemonic(entropy)

    return this.keyPairService.signWithWallet(wallet, transaction, mnemonic, bip39Passphrase)
  }

  private async signMessages(
    unsignedMessages: DeserializedUnsignedMessage[],
    bip39Passphrase: string = '',
    protocolIdentifier?: ProtocolSymbols
  ): Promise<Action> {
    try {
      const signedMessages: DeserializedSignedMessage[] = await Promise.all(
        unsignedMessages.map(
          async (message: DeserializedUnsignedMessage): Promise<DeserializedSignedMessage> => {
            const signature: string = await this.signMessage(message.data, bip39Passphrase, message.wallet, protocolIdentifier)

            return {
              type: 'signed',
              id: message.id,
              protocol: message.protocol ?? protocolIdentifier,
              data: {
                message: message.data.message,
                publicKey: message.data.publicKey,
                signature,
                callbackURL: message.data.callbackURL
              },
              wallet: message.wallet
            }
          }
        )
      )

      return actions.messagesSigned({ messages: signedMessages })
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.warn(error)

      if (error.message?.toLowerCase().startsWith('secret not found')) {
        return actions.secretNotFound()
      } else if (error.message?.toLowerCase().startsWith('protocol not found')) {
        return actions.protocolNotFound()
      } else if (error.message?.toLowerCase().startsWith('invalid bip-39 passphrase')) {
        return actions.invalidBip39Passphrase()
      }

      return actions.unknownError({ message: typeof error === 'string' ? error : error.message })
    }
  }

  private async signMessage(
    message: MessageSignRequest,
    bip39Passphrase: string,
    wallet?: AirGapWallet,
    protocolIdentifier?: ProtocolSymbols
  ): Promise<string> {
    const secret: Secret | undefined =
      wallet !== undefined
        ? this.secretsService.findByPublicKey(wallet.publicKey) ?? this.secretsService.getActiveSecret()
        : this.secretsService.getActiveSecret()

    if (secret === undefined) {
      throw new Error('Secret not found')
    }

    const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = bip39.entropyToMnemonic(entropy)

    if (wallet !== undefined) {
      return this.keyPairService.signWithWallet(wallet, message, mnemonic, bip39Passphrase)
    } else {
      let protocol: ICoinProtocol | undefined
      try {
        protocol =
          protocolIdentifier !== undefined ? await this.protocolService.getProtocol(protocolIdentifier, undefined, false) : undefined
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.warn(error)
        protocol = undefined
      }

      if (protocol === undefined) {
        throw new Error('Protocol not found')
      }

      return this.keyPairService.signWithProtocol(protocol, message, mnemonic, bip39Passphrase, false, protocol.standardDerivationPath)
    }
  }

  private async navigateWithSignedTransactions(transactions: DeserializedSignedTransaction[]): Promise<void> {
    const broadcastUrl: string = await this.generateTransactionBroadcastUrl(transactions)
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.TRANSACTION_BROADCAST,
        url: broadcastUrl,
        wallets: transactions.map((transaction: DeserializedSignedTransaction): AirGapWallet => transaction.wallet),
        signedTxs: transactions.map((transaction: DeserializedSignedTransaction): string => transaction.data.transaction)
      },
      this.secretsService.getActiveSecret()
    )
  }

  private async generateTransactionBroadcastUrl(transactions: DeserializedSignedTransaction[]): Promise<string> {
    const signResponses: IACMessageDefinitionObject[] = transactions.map(
      (transaction: DeserializedSignedTransaction): IACMessageDefinitionObject => ({
        id: transaction.id,
        protocol: transaction.wallet.protocol.identifier,
        type: IACMessageType.TransactionSignResponse,
        payload: {
          accountIdentifier: transaction.data.accountIdentifier,
          transaction: transaction.data.transaction,
          from: flattenAirGapTxAddresses(transaction.details, 'from'),
          to: flattenAirGapTxAddresses(transaction.details, 'to'),
          amount: sumAirGapTxValues(transaction.details, 'amount'),
          fee: sumAirGapTxValues(transaction.details, 'fee')
        }
      })
    )

    return this.generateBroadcastUrl(signResponses, transactions[0]?.data.callbackURL)
  }

  private async navigateWithSignedMessages(messages: DeserializedSignedMessage[]): Promise<void> {
    const broadcastUrl: string = await this.generateMessageBroadcastUrl(messages)
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.MESSAGE_SIGN_REQUEST,
        url: broadcastUrl,
        messageSignResponse:
          messages[0] !== undefined
            ? {
                message: messages[0].data.message,
                publicKey: messages[0].data.publicKey,
                signature: messages[0].data.signature
              }
            : undefined
      },
      this.secretsService.getActiveSecret()
    )
  }

  private async generateMessageBroadcastUrl(messages: DeserializedSignedMessage[]): Promise<string> {
    const signResponses: IACMessageDefinitionObject[] = messages.map(
      (message: DeserializedSignedMessage): IACMessageDefinitionObject => ({
        id: message.id,
        protocol: message.protocol,
        type: IACMessageType.MessageSignResponse,
        payload: {
          message: message.data.message,
          publicKey: message.data.publicKey,
          signature: message.data.signature
        }
      })
    )

    return this.generateBroadcastUrl(signResponses, messages[0]?.data.callbackURL)
  }

  private async generateBroadcastUrl(messages: IACMessageDefinitionObject[], callbackUrl?: string): Promise<string> {
    const serialized: string[] = await this.serializerService.serialize(messages)

    return `${callbackUrl || 'airgap-wallet://?d='}${serialized.join(',')}`
  }
}
