import { ProtocolSymbols } from '@airgap/coinlib-core'
import { createAction, props } from '@ngrx/store'

// tslint:disable: typedef
import {
  DeserializedMessage,
  DeserializedSignedMessage,
  DeserializedSignedTransaction,
  DeserializedTransaction,
  Task,
  Mode
} from './deserialized.detail.types'

// FIXME [#210]: remove once the performance issue is resolved
export interface UserInput {
  bip39Passphrase?: string
  protocol?: ProtocolSymbols
}
// [#210]

const featureName = 'Deserialized Detail'

/**************** View Lifecycle ****************/

export const viewInitialization = createAction(`[${featureName}] View Initialization`)

/**************** Navigation Data ****************/

export const navigationDataLoading = createAction(`[${featureName}] Navigation Data Loading`)
export const navigationDataLoaded = createAction(
  `[${featureName}] Navigation Data Loaded`,
  props<{
    mode: Mode
    title: string
    button: string | undefined
    transactions: DeserializedTransaction[]
    messages: DeserializedMessage[]
    raw: string
  }>()
)
export const navigationDataLoadingError = createAction(
  `[${featureName}] Navigation Data Loading Error`,
  props<{ mode: Mode; title: string; button: string | undefined; raw: string }>()
)
export const invalidData = createAction(`[${featureName}] Invalid Navigation Data`)

/**************** User Interaction ****************/

export const approved = createAction(`[${featureName}] Approved`)

// FIXME [#210]: remove once the performance issue is resolved
export const continueApproved = createAction(`[${featureName}] Continue Approved`, props<{ userInput: UserInput }>())
// [#210]

export const alertDismissed = createAction(`[${featureName}] Alert Dismissed`, props<{ id: string }>())
export const modalDismissed = createAction(`[${featureName}] Modal Dismissed`, props<{ id: string }>())

export const bip39PassphraseProvided = createAction(`[${featureName}] BIP-39 Passphrase Provided`, props<{ passphrase: string }>())
export const signingProtocolProvided = createAction(`[${featureName}] Signing Protocol Provided`, props<{ protocol: ProtocolSymbols }>())

/**************** Internal ****************/

// export const runningBlockingTask = createAction(`[${featureName}] Running Blocking Task`, props<{ task: Task }>())

// FIXME [#210] replace with the above once the performance issue is resolved
export const runningBlockingTask = createAction(`[${featureName}] Running Blocking Task`, props<{ task: Task; userInput: UserInput }>())
// [#210]

export const transactionsSigned = createAction(
  `[${featureName}] Transactions Signed`,
  props<{ transactions: DeserializedSignedTransaction[] }>()
)
export const messagesSigned = createAction(`[${featureName}] Messages Signed`, props<{ messages: DeserializedSignedMessage[] }>())

export const loaderDismissed = createAction(`[${featureName}] Loader Dismissed`, props<{ id: string }>())

export const secretNotFound = createAction(`[${featureName}] Secret Not Found`)
export const protocolNotFound = createAction(`[${featureName}] Protocol Not Found`)
export const invalidBip39Passphrase = createAction(`[${featureName}] Invalid BIP-39 Passphrase`)

export const unknownError = createAction(`[${featureName}] Unknown Error`, props<{ message?: string }>())
