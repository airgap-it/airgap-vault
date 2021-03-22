import { ProtocolSymbols } from '@airgap/coinlib-core'
import { createAction, props } from '@ngrx/store'
import { Secret } from 'src/app/models/secret'

const featureName = 'Account Share Select'

/**************** View Lifecycle ****************/

export const viewInitialization = createAction(`[${featureName}] View Initialization`)
export const initialDataLoaded = createAction(`[${featureName}] Initial Data Loaded`, props<{ secrets: Secret[] }>())

/**************** User Interaction ****************/

export const secretToggled = createAction(`[${featureName}] Secret Toggled`, props<{ secretId: string }>())
export const syncButtonClicked = createAction(`[${featureName}] Sync Button Clicked`)

/**************** Internal ****************/

export const invalidBip39Passphrase = createAction(
  `[${featureName}] Invalid BIP-39 Passphrase`,
  props<{ secretId: string; protocolIdentifier: ProtocolSymbols }>()
)
