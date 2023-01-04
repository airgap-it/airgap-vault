import {
  assertNever,
  flattenAirGapTxAddresses,
  IACContext,
  KeyPairService,
  ProtocolService,
  sumAirGapTxValues,
  TransactionService
} from '@airgap/angular-core'
import {
  AirGapWallet,
  IAirGapTransaction,
  ICoinProtocol,
  MainProtocolSymbols,
  ProtocolSymbols,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/coinlib-core'
import { IACMessageType, IACMessageDefinitionObjectV3, MessageSignRequest } from '@airgap/serializer'
import { TezosCryptoClient, TezosSaplingProtocol } from '@airgap/tezos'
import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { TranslateService } from '@ngx-translate/core'
import * as bip39 from 'bip39'
import { concat, from, of } from 'rxjs'
import { concatMap, first, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { MnemonicSecret } from '../../models/secret'
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
  Payload,
  Task
} from './deserialized.detail.types'

@Injectable()
export class DeserializedDetailEffects {
  public navigationData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.viewInitialization),
      switchMap(() => concat(of(actions.navigationDataLoading()), from(this.loadNavigationData()).pipe(first())))
    )
  )

  // FIXME [#210]:
  // We can no longer execute the signing step as a single action due to Sapling heavy computational transaction signing
  // https://gitlab.papers.tech/papers/airgap/airgap-vault/-/issues/210

  // public approved$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(actions.approved, actions.bip39PassphraseProvided, actions.signingProtocolProvided),
  //     concatMap((action) => from([action]).pipe(withLatestFrom(this.store.select(fromDeserializedDetail.selectFinalPayload)))),
  //     switchMap(([action, payload]) => {
  //       const userInput = {
  //         bip39Passphrase: 'passphrase' in action ? action.passphrase : undefined,
  //         protocol: 'protocol' in action ? action.protocol : undefined
  //       }

  //       return concat(
  //         of(actions.runningBlockingTask({ task: this.identifyPayloadTask(payload) })),
  //         from(this.handlePayload(payload, userInput)).pipe(first())
  //       )
  //     })
  //   )
  // )
  // [#210]

  // FIXME [#210]: replace with the above once the performance issue is resolved
  public approved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.approved, actions.bip39PassphraseProvided, actions.signingProtocolProvided),
      concatMap((action) => from([action]).pipe(withLatestFrom(this.store.select(fromDeserializedDetail.selectFinalPayload)))),
      switchMap(([action, payload]) => {
        const userInput = {
          bip39Passphrase: 'passphrase' in action ? action.passphrase : undefined,
          protocol: 'protocol' in action ? action.protocol : undefined
        }

        return concat(of(actions.runningBlockingTask({ task: this.identifyPayloadTask(payload), userInput })))
      })
    )
  )
  // [#210]

  // FIXME [#210]: remove once the performance issue is resolved
  public continueApproved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.continueApproved),
      concatMap((action) => from([action]).pipe(withLatestFrom(this.store.select(fromDeserializedDetail.selectFinalPayload)))),
      switchMap(([action, payload]) => from(this.handlePayload(payload, action.userInput)).pipe(first()))
    )
  )
  // [#210]

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
          this.signTransactionInfoToUnsignedTransactions(state.transactionInfos, state.iacContext),
          this.signTransactionInfoToUnsignedMessages(state.transactionInfos, state.iacContext)
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
    transactionInfo: SignTransactionInfo[],
    iacContext?: IACContext
  ): Promise<DeserializedUnsignedTransaction[]> {
    return Promise.all(
      transactionInfo
        .map((info: SignTransactionInfo): [AirGapWallet, IACMessageDefinitionObjectV3] => [info.wallet, info.signTransactionRequest])
        .filter(
          ([_, request]: [AirGapWallet, IACMessageDefinitionObjectV3]): boolean => request.type === IACMessageType.TransactionSignRequest
        )
        .map(async ([wallet, request]: [AirGapWallet, IACMessageDefinitionObjectV3]): Promise<DeserializedUnsignedTransaction> => {
          let details: IAirGapTransaction[]
          if (await this.checkIfSaplingTransaction(request.payload as UnsignedTransaction, request.protocol)) {
            details = await this.transactionService.getDetailsFromIACMessages([request], {
              overrideProtocol: await this.getSaplingProtocol(),
              data: {
                knownViewingKeys: await this.secretsService.getKnownViewingKeys()
              }
            })
          } else {
            details = await this.transactionService.getDetailsFromIACMessages([request])
          }

          return {
            type: 'unsigned',
            id: request.id,
            details,
            data: request.payload as UnsignedTransaction,
            iacContext,
            wallet,
            originalProtocolIdentifier: request.protocol !== (await wallet.protocol.getSymbol()) ? request.protocol : undefined
          }
        })
    )
  }

  private async signTransactionInfoToUnsignedMessages(
    transactionInfo: SignTransactionInfo[],
    iacContext?: IACContext
  ): Promise<DeserializedUnsignedMessage[]> {
    return Promise.all(
      transactionInfo
        .map((info: SignTransactionInfo): [AirGapWallet, IACMessageDefinitionObjectV3] => [info.wallet, info.signTransactionRequest])
        .filter(([_, request]: [AirGapWallet, IACMessageDefinitionObjectV3]): boolean => request.type === IACMessageType.MessageSignRequest)
        .map(async ([wallet, request]: [AirGapWallet, IACMessageDefinitionObjectV3]): Promise<DeserializedUnsignedMessage> => {
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
            iacContext,
            blake2bHash,
            wallet,
            originalProtocolIdentifier: request.protocol !== (await wallet.protocol.getSymbol()) ? request.protocol : undefined
          }
        })
    )
  }

  private identifyPayloadTask(payload: Payload): Task {
    switch (payload.mode) {
      case Mode.SIGN_TRANSACTION:
        return 'signTransaction'
      case Mode.SIGN_MESSAGE:
        return 'signMessage'
      default:
        return 'generic'
    }
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
        unsignedTransactions.map(async (transaction: DeserializedUnsignedTransaction): Promise<DeserializedSignedTransaction> => {
          const signed: string = await this.signTransaction(transaction.wallet, transaction.data, transaction.iacContext, bip39Passphrase)

          return {
            type: 'signed',
            id: transaction.id,
            details: transaction.details,
            data: {
              accountIdentifier: transaction.wallet.publicKey.substr(-6),
              transaction: signed,
              callbackURL: transaction.data.callbackURL
            },
            iacContext: transaction.iacContext,
            wallet: transaction.wallet,
            originalProtocolIdentifier: transaction.originalProtocolIdentifier
          }
        })
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

  private async signTransaction(
    wallet: AirGapWallet,
    transaction: UnsignedTransaction,
    iacContext: IACContext | undefined,
    bip39Passphrase: string
  ): Promise<string> {
    const secret: MnemonicSecret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      throw new Error('Secret not found')
    }

    const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = bip39.entropyToMnemonic(entropy)

    return this.keyPairService.signWithProtocol(
      wallet.protocol,
      transaction,
      mnemonic,
      bip39Passphrase,
      wallet.isExtendedPublicKey,
      wallet.derivationPath,
      await this.getChildDerivationPath(wallet.derivationPath, iacContext?.derivationPath)
    )
  }

  private async signMessages(
    unsignedMessages: DeserializedUnsignedMessage[],
    bip39Passphrase: string = '',
    protocolIdentifier?: ProtocolSymbols
  ): Promise<Action> {
    try {
      const signedMessages: DeserializedSignedMessage[] = await Promise.all(
        unsignedMessages.map(async (message: DeserializedUnsignedMessage): Promise<DeserializedSignedMessage> => {
          const signature: string = await this.signMessage(
            message.data,
            message.iacContext,
            bip39Passphrase,
            message.wallet,
            protocolIdentifier
          )

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
            iacContext: message.iacContext,
            wallet: message.wallet,
            originalProtocolIdentifier: message.originalProtocolIdentifier
          }
        })
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
    iacContext: IACContext | undefined,
    bip39Passphrase: string,
    wallet?: AirGapWallet,
    protocolIdentifier?: ProtocolSymbols
  ): Promise<string> {
    const secret: MnemonicSecret | undefined =
      wallet !== undefined
        ? this.secretsService.findByPublicKey(wallet.publicKey) ?? this.secretsService.getActiveSecret()
        : this.secretsService.getActiveSecret()

    if (secret === undefined) {
      throw new Error('Secret not found')
    }

    const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = bip39.entropyToMnemonic(entropy)

    if (wallet !== undefined) {
      return this.keyPairService.signWithProtocol(
        wallet.protocol,
        message,
        mnemonic,
        bip39Passphrase,
        wallet.isExtendedPublicKey,
        wallet.derivationPath,
        await this.getChildDerivationPath(wallet.derivationPath, iacContext?.derivationPath)
      )
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

      return this.keyPairService.signWithProtocol(
        protocol,
        message,
        mnemonic,
        bip39Passphrase,
        false,
        await protocol.getStandardDerivationPath(),
        await this.getChildDerivationPath(await protocol.getStandardDerivationPath(), iacContext?.derivationPath)
      )
    }
  }

  private async navigateWithSignedTransactions(transactions: DeserializedSignedTransaction[]): Promise<void> {
    const messages: IACMessageDefinitionObjectV3[] = await this.generateTransactionIACMessages(transactions)
    this.interactionService.startInteraction({
      operationType: InteractionOperationType.TRANSACTION_BROADCAST,
      iacMessage: messages,
      wallets: transactions.map((transaction: DeserializedSignedTransaction): AirGapWallet => transaction.wallet),
      signedTxs: transactions.map((transaction: DeserializedSignedTransaction): string => transaction.data.transaction)
    })
  }

  private async generateTransactionIACMessages(transactions: DeserializedSignedTransaction[]): Promise<IACMessageDefinitionObjectV3[]> {
    const signResponses: IACMessageDefinitionObjectV3[] = await Promise.all(transactions.map(
      async (transaction: DeserializedSignedTransaction): Promise<IACMessageDefinitionObjectV3> => ({
        id: transaction.id,
        protocol: transaction.originalProtocolIdentifier ?? await transaction.wallet.protocol.getIdentifier(),
        type: IACMessageType.TransactionSignResponse,
        payload: {
          accountIdentifier: transaction.data.accountIdentifier,
          transaction: transaction.data.transaction,
          from: flattenAirGapTxAddresses(transaction.details, 'from'),
          to: flattenAirGapTxAddresses(transaction.details, 'to'),
          amount: sumAirGapTxValues(transaction.details, 'amount'),
          fee: sumAirGapTxValues(transaction.details, 'fee')
        } as any
        // Before splitting coinlib and introducing v1 protocols, payload was a union of all known messages, protocol specific transactions included.
        // The common interface defined for the transactions specifies only the `accountIdentifier` and `transaction` fields, the rest seen in the above structure
        // comes from the signed Bitcoin transaction. The changes introduced for v1 protocols simplified the type of `payload` by removing the protocol specific
        // messages from the union, basing the type only on the common interface. Because of that, the above no longer compiles unless forced to, therefore `as any`
        // had to be applied.
        // !!! This should be adressed and improved during the v0 -> v1 migration !!!
      })
    ))
    return signResponses
  }

  private async navigateWithSignedMessages(messages: DeserializedSignedMessage[]): Promise<void> {
    const iacMessages: IACMessageDefinitionObjectV3[] = await this.generateIACMessages(messages)
    this.interactionService.startInteraction({
      operationType: InteractionOperationType.MESSAGE_SIGN_REQUEST,
      iacMessage: iacMessages,
      messageSignResponse:
        messages[0] !== undefined
          ? {
              message: messages[0].data.message,
              publicKey: messages[0].data.publicKey,
              signature: messages[0].data.signature
            }
          : undefined
    })
  }

  private async generateIACMessages(messages: DeserializedSignedMessage[]): Promise<IACMessageDefinitionObjectV3[]> {
    const signResponses: IACMessageDefinitionObjectV3[] = messages.map(
      (message: DeserializedSignedMessage): IACMessageDefinitionObjectV3 => ({
        id: message.id,
        protocol: message.originalProtocolIdentifier ?? message.protocol,
        type: IACMessageType.MessageSignResponse,
        payload: {
          message: message.data.message,
          publicKey: message.data.publicKey,
          signature: message.data.signature
        }
      })
    )
    return signResponses
  }

  private async checkIfSaplingTransaction(transaction: UnsignedTransaction, protocolIdentifier: ProtocolSymbols): Promise<boolean> {
    if (protocolIdentifier === MainProtocolSymbols.XTZ) {
      const tezosProtocol: ICoinProtocol = await this.protocolService.getProtocol(protocolIdentifier)
      const saplingProtocol: TezosSaplingProtocol = await this.getSaplingProtocol()

      const txDetails: IAirGapTransaction[] = await tezosProtocol.getTransactionDetails(transaction)
      const recipients: string[] = txDetails
        .map((details) => details.to)
        .reduce((flatten: string[], next: string[]) => flatten.concat(next), [])

      return recipients.includes((await saplingProtocol.getOptions()).config.contractAddress)
    }

    return protocolIdentifier === MainProtocolSymbols.XTZ_SHIELDED
  }

  private async getSaplingProtocol(): Promise<TezosSaplingProtocol> {
    return (await this.protocolService.getProtocol(MainProtocolSymbols.XTZ_SHIELDED)) as TezosSaplingProtocol
  }

  private async getChildDerivationPath(walletDerivationPath: string, accountDerivationPath?: string): Promise<string | undefined> {
    // WalletDerivationPath is from us, what the user used to create his account
    // AccountDerivationPath is the more specific

    if (!accountDerivationPath) {
      return undefined
    }

    let normalizedDerivationPath: string = accountDerivationPath
    if (!normalizedDerivationPath.startsWith('m')) {
      normalizedDerivationPath = `m/${normalizedDerivationPath}`
    }

    if (!normalizedDerivationPath.startsWith(walletDerivationPath)) {
      throw new Error('Derivation paths do not match!')
    }

    return normalizedDerivationPath.slice(walletDerivationPath.length + 1)
  }
}
