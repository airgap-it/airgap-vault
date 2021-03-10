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
  UnsignedMessage
} from './deserialized.detail.types'

/**************** STATE ****************/

const MAX_BIP39_PASSPHRASE_TRIES = 1
export interface FeatureState {
  mode: Mode | undefined
  title: string
  button: string | undefined
  alert: UIAction<Alert> | undefined
  modal: UIAction<Modal> | undefined
  isBusy: boolean
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
  alert: undefined,
  modal: undefined,
  isBusy: false,
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
    alert: undefined,
    modal: undefined,
    isBusy: false,
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
    }
  })),
  on(actions.navigationDataLoaded, (state, { mode, title, button, transactions, messages, raw }) => ({
    ...state,
    mode,
    title,
    button,
    alert: undefined,
    modal: undefined,
    isBusy: false,
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
    }
  })),
  on(actions.navigationDataLoadingError, (state, { mode, title, button, raw }) => ({
    ...state,
    mode,
    title,
    button,
    alert: undefined,
    modal: undefined,
    isBusy: false,
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
    alert: undefined,
    isBusy: false,
    transactions: {
      value: (state.transactions.value ?? []).concat(transactions),
      status: state.transactions.status
    }
  })),
  on(actions.messagesSigned, (state, { messages }) => ({
    ...state,
    alert: undefined,
    modal: undefined,
    isBusy: false,
    messages: {
      value: (state.messages.value ?? []).concat(messages),
      status: state.transactions.status
    }
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
          alert: {
            id: generateGUID(),
            value: { type: 'bip39Passphrase' as Bip39PassphraseAlert['type'] },
            status: UIActionStatus.PENDING
          },
          modal: undefined,
          isBusy: false,
          bip39PassphraseTries: state.bip39PassphraseTries + 1
        }
      : {
          ...state,
          alert: {
            id: generateGUID(),
            value: { type: 'bip39PassphraseError' as Bip39PassphraseErrorAlert['type'] },
            status: UIActionStatus.PENDING
          },
          modal: undefined,
          isBusy: false,
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
    alert: undefined,
    modal: {
      id: generateGUID(),
      value: 'selectSigningAccount' as Modal,
      status: UIActionStatus.PENDING
    },
    isBusy: false
  })),
  on(actions.runningBlockingTask, (state) => ({
    ...state,
    isBusy: true
  })),
  on(actions.unknownError, (state, { message }) => ({
    ...state,
    alert: {
      id: generateGUID(),
      value: {
        type: 'unknownError' as UnknownErrorAlert['type'],
        message: message?.length > 0 ? message : undefined
      },
      status: UIActionStatus.PENDING
    },
    modal: undefined,
    isBusy: false
  }))
)

/**************** Selectors ****************/

export const selectFeatureState = createFeatureSelector<State, FeatureState>('deserializedDetail')

export const selectMode = createSelector(selectFeatureState, (state: FeatureState): Mode | undefined => state.mode)
export const selectTitle = createSelector(selectFeatureState, (state: FeatureState): string => state.title)
export const selectButton = createSelector(selectFeatureState, (state: FeatureState): string | undefined => state.button)
export const selectAlert = createSelector(selectFeatureState, (state: FeatureState): UIAction<Alert> | undefined => state.alert)
export const selectModal = createSelector(selectFeatureState, (state: FeatureState): UIAction<Modal> | undefined => state.modal)
export const selectIsBusy = createSelector(selectFeatureState, (state: FeatureState): boolean => state.isBusy)

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
      const blake2bHash: string | undefined = message.type === 'unsigned'
        ? message.blake2bHash
        : undefined
      
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
