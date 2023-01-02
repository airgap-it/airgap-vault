// tslint:disable: typedef
// tslint:disable: max-file-line-count
import { assertNever, flattened, generateGUID, UIAction, UIActionStatus, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { IAirGapTransaction } from '@airgap/coinlib-core'
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store'

import * as fromRoot from '../../app.reducers'

import * as actions from './deserialized-detail.actions'
import {
  Alert,
  Bip39PassphraseAlert,
  Bip39PassphraseErrorAlert,
  DeserializedMessage,
  DeserializedSignedTransaction,
  DeserializedTransaction,
  DeserializedUnsignedMessage,
  DeserializedUnsignedTransaction,
  Modal,
  Mode,
  Payload,
  SecretNotFoundErrorAlert,
  UnknownErrorAlert,
  UnsignedMessage,
  Task
} from './deserialized.detail.types'

/**************** STATE ****************/

const MAX_BIP39_PASSPHRASE_TRIES = 1
export interface FeatureState {
  mode: Mode | undefined
  title: string
  button: string | undefined
  // loader: UIAction<Task> | undefined
  // FIXME [#210] replace with the above once the performance issue is resolved
  loader: (UIAction<Task> & { userInput: actions.UserInput }) | undefined
  // [#210]
  alert: UIAction<Alert> | undefined
  modal: UIAction<Modal> | undefined
  transactions: UIResource<DeserializedTransaction[]>
  messages: UIResource<DeserializedMessage[]>
  raw: UIResource<string>
  bip39PassphraseTries: number
}

export interface State extends fromRoot.State {
  deserializedDetail: FeatureState
}

/**************** Reducers ****************/

const initialState: FeatureState = {
  mode: undefined,
  title: '',
  button: undefined,
  loader: undefined,
  alert: undefined,
  modal: undefined,
  transactions: {
    value: undefined,
    status: UIResourceStatus.IDLE
  },
  messages: {
    value: undefined,
    status: UIResourceStatus.IDLE
  },
  raw: {
    value: undefined,
    status: UIResourceStatus.IDLE
  },
  bip39PassphraseTries: 0
}

export const reducer = createReducer(
  initialState,
  on(actions.navigationDataLoading, (state) => ({
    ...state,
    loader: undefined,
    alert: undefined,
    modal: undefined,
    transactions: {
      value: state.transactions.value,
      status: UIResourceStatus.LOADING
    },
    messages: {
      value: state.messages.value,
      status: UIResourceStatus.LOADING
    },
    raw: {
      value: state.raw.value,
      status: UIResourceStatus.LOADING
    },
    bip39PassphraseTries: 0
  })),
  on(actions.navigationDataLoaded, (state, { mode, title, button, transactions, messages, raw }) => ({
    ...state,
    mode,
    title,
    button,
    loader: undefined,
    alert: undefined,
    modal: undefined,
    transactions: {
      value: transactions,
      status: UIResourceStatus.SUCCESS
    },
    messages: {
      value: messages,
      status: UIResourceStatus.SUCCESS
    },
    raw: {
      value: raw,
      status: UIResourceStatus.SUCCESS
    },
    bip39PassphraseTries: 0
  })),
  on(actions.navigationDataLoadingError, (state, { mode, title, button, raw }) => ({
    ...state,
    mode,
    title,
    button,
    loader: undefined,
    alert: undefined,
    modal: undefined,
    transactions: {
      value: undefined,
      status: UIResourceStatus.ERROR
    },
    messages: {
      value: undefined,
      status: UIResourceStatus.ERROR
    },
    raw: {
      value: raw,
      status: UIResourceStatus.SUCCESS
    }
  })),
  on(actions.transactionsSigned, (state, { transactions }) => ({
    ...state,
    loader: undefined,
    alert: undefined,
    transactions: {
      value: (state.transactions.value ?? []).concat(transactions),
      status: state.transactions.status
    },
    bip39PassphraseTries: 0
  })),
  on(actions.messagesSigned, (state, { messages }) => ({
    ...state,
    loader: undefined,
    alert: undefined,
    modal: undefined,
    messages: {
      value: (state.messages.value ?? []).concat(messages),
      status: state.transactions.status
    },
    bip39PassphraseTries: 0
  })),
  on(actions.loaderDismissed, (state, { id }) => ({
    ...state,
    loader:
      state.loader !== undefined
        ? {
            id: state.loader.id,
            value: state.loader.value,
            status: id === state.loader.id ? UIActionStatus.HANDLED : state.loader.status,
            userInput: id === state.loader.id ? {} : state.loader.userInput
          }
        : undefined
  })),
  on(actions.alertDismissed, (state, { id }) => ({
    ...state,
    alert:
      state.alert !== undefined
        ? {
            id: state.alert.id,
            value: state.alert.value,
            status: id === state.alert.id ? UIActionStatus.HANDLED : state.alert.status
          }
        : undefined,
    modal: undefined
  })),
  on(actions.modalDismissed, (state, { id }) => ({
    ...state,
    alert: undefined,
    modal:
      state.modal !== undefined
        ? {
            id: state.modal.id,
            value: state.modal.value,
            status: id === state.modal.id ? UIActionStatus.HANDLED : state.modal.status
          }
        : undefined
  })),
  on(actions.invalidBip39Passphrase, (state) => {
    return state.bip39PassphraseTries < MAX_BIP39_PASSPHRASE_TRIES
      ? {
          ...state,
          loader: undefined,
          alert: {
            id: generateGUID(),
            value: { type: 'bip39Passphrase' as Bip39PassphraseAlert['type'] },
            status: UIActionStatus.PENDING
          },
          modal: undefined,
          bip39PassphraseTries: state.bip39PassphraseTries + 1
        }
      : {
          ...state,
          loader: undefined,
          alert: {
            id: generateGUID(),
            value: { type: 'bip39PassphraseError' as Bip39PassphraseErrorAlert['type'] },
            status: UIActionStatus.PENDING
          },
          modal: undefined,
          bip39PassphraseTries: 0
        }
  }),
  on(actions.secretNotFound, (state) => ({
    ...state,
    alert: {
      id: generateGUID(),
      value: { type: 'secretNotFound' as SecretNotFoundErrorAlert['type'] },
      status: UIActionStatus.PENDING
    },
    modal: undefined
  })),
  on(actions.protocolNotFound, (state) => ({
    ...state,
    loader: undefined,
    alert: undefined,
    modal: {
      id: generateGUID(),
      value: 'selectSigningAccount' as Modal,
      status: UIActionStatus.PENDING
    }
  })),
  on(actions.runningBlockingTask, (state, { task, userInput }) => ({
    ...state,
    loader: {
      id: generateGUID(),
      value: task,
      status: UIActionStatus.PENDING,
      userInput
    }
  })),
  on(actions.unknownError, (state, { message }) => ({
    ...state,
    loader: undefined,
    alert: {
      id: generateGUID(),
      value: {
        type: 'unknownError' as UnknownErrorAlert['type'],
        message: message?.length > 0 ? message : undefined
      },
      status: UIActionStatus.PENDING
    },
    modal: undefined
  }))
)

/**************** Selectors ****************/

export const selectFeatureState = createFeatureSelector<State, FeatureState>('deserializedDetail')

export const selectMode = createSelector(selectFeatureState, (state: FeatureState): FeatureState['mode'] => state.mode)
export const selectTitle = createSelector(selectFeatureState, (state: FeatureState): FeatureState['title'] => state.title)
export const selectButton = createSelector(selectFeatureState, (state: FeatureState): FeatureState['button'] => state.button)
export const selectLoader = createSelector(selectFeatureState, (state: FeatureState): FeatureState['loader'] => state.loader)
export const selectAlert = createSelector(selectFeatureState, (state: FeatureState): FeatureState['alert'] => state.alert)
export const selectModal = createSelector(selectFeatureState, (state: FeatureState): FeatureState['modal'] => state.modal)

export const selectTransactions = createSelector(
  selectFeatureState,
  (state: FeatureState): UIResource<DeserializedTransaction[]> | undefined => state.transactions
)

const createSelectTransaction = <T extends DeserializedTransaction>(
  type: DeserializedTransaction['type']
): ((transactions: UIResource<DeserializedTransaction[]>) => UIResource<T[]>) => {
  return (transactions: UIResource<DeserializedTransaction[]>): UIResource<T[]> => ({
    value: transactions.value?.filter((transaction: DeserializedTransaction) => transaction.type === type) as T[],
    status: transactions.status
  })
}
export const selectUnsignedTransactions = createSelector(
  selectTransactions,
  createSelectTransaction<DeserializedUnsignedTransaction>('unsigned')
)
export const selectSignedTransactions = createSelector(selectTransactions, createSelectTransaction<DeserializedSignedTransaction>('signed'))

const getTransactionsDetails = (
  transactions: UIResource<DeserializedTransaction[]>,
  type?: DeserializedTransaction['type']
): UIResource<IAirGapTransaction[]> => {
  const details: IAirGapTransaction[][] | undefined = transactions.value
    ?.filter((transaction: DeserializedTransaction) => (type !== undefined ? transaction.type === type : true))
    .map((transaction: DeserializedTransaction) => transaction.details)

  return {
    value: details !== undefined ? flattened(details) : undefined,
    status: transactions.status
  }
}

export const selectTransactionsDetails = createSelector(
  selectMode,
  selectTransactions,
  (mode: Mode, transactions: UIResource<DeserializedTransaction[]>): UIResource<IAirGapTransaction[]> => {
    switch (mode) {
      case Mode.SIGN_TRANSACTION:
        return getTransactionsDetails(transactions, 'unsigned')
      default:
        return {
          value: undefined,
          status: transactions.status
        }
    }
  }
)
export const selectUnsignedTransactionsDetails = createSelector(selectUnsignedTransactions, getTransactionsDetails)
export const selectSignedTransactionsDetails = createSelector(selectSignedTransactions, getTransactionsDetails)

export const selectMessages = createSelector(selectFeatureState, (state: FeatureState) => state.messages)

const createSelectMessage = <T extends DeserializedMessage>(
  type: DeserializedMessage['type']
): ((messages: UIResource<DeserializedMessage[]>) => UIResource<T[]>) => {
  return (messages: UIResource<DeserializedMessage[]>): UIResource<T[]> => ({
    value: messages.value?.filter((message: DeserializedMessage) => message.type === type) as T[],
    status: messages.status
  })
}

export const selectUnsignedMessages = createSelector(selectMessages, createSelectMessage<DeserializedUnsignedMessage>('unsigned'))

const getMessagesData = (
  messages: UIResource<DeserializedMessage[]>,
  type?: DeserializedMessage['type']
): UIResource<UnsignedMessage[]> => {
  const details: UnsignedMessage[] | undefined = messages.value
    ?.filter((message: DeserializedMessage) => (type !== undefined ? message.type === type : true))
    .map((message: DeserializedMessage) => {
      const blake2bHash: string | undefined = message.type === 'unsigned' ? message.blake2bHash : undefined

      return { data: message.data.message, blake2bHash }
    })

  return {
    value: details,
    status: messages.status
  }
}

export const selectMessagesData = createSelector(
  selectMode,
  selectMessages,
  (mode: Mode, messages: UIResource<DeserializedMessage[]>): UIResource<UnsignedMessage[]> => {
    switch (mode) {
      case Mode.SIGN_MESSAGE:
        return getMessagesData(messages, 'unsigned')
      default:
        return {
          value: undefined,
          status: messages.status
        }
    }
  }
)

export const selectUnsignedMessagesData = createSelector(selectUnsignedMessages, getMessagesData)

export const selectRaw = createSelector(selectFeatureState, (state: FeatureState) => state.raw)

export const selectFinalPayload = createSelector(
  selectMode,
  selectUnsignedTransactions,
  selectSignedTransactions,
  selectUnsignedMessages,
  (
    mode: Mode,
    unsignedTransactions: UIResource<DeserializedUnsignedTransaction[]>,
    _signedTransactions: UIResource<DeserializedSignedTransaction[]>,
    unsignedMessages: UIResource<DeserializedUnsignedMessage[]>
  ): Payload => {
    switch (mode) {
      case Mode.SIGN_TRANSACTION:
        return {
          mode,
          data: unsignedTransactions.value
        }
      case Mode.SIGN_MESSAGE:
        return {
          mode,
          data: unsignedMessages.value
        }
      default:
        assertNever('selectFinalPayload', mode)
    }
  }
)
