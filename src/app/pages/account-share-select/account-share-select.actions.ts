import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { createAction, props } from '@ngrx/store'

import { Secret } from '../../models/secret'

const featureName = 'Account Share Select'

/**************** View Lifecycle ****************/

export const viewInitialization = createAction(`[${featureName}] View Initialization`)
export const initialDataLoaded = createAction(`[${featureName}] Initial Data Loaded`, props<{ secrets: Secret[] }>())

/**************** User Interaction ****************/

export const secretToggled = createAction(`[${featureName}] Secret Toggled`, props<{ secretId: string }>())
export const syncButtonClicked = createAction(`[${featureName}] Sync Button Clicked`)

export const alertDismissed = createAction(`[${featureName}] Alert Dismissed`, props<{ id: string }>())

export const migrationAlertAccepted = createAction(
  `[${featureName}] Migration Alert Accepted`,
  props<{ shareUrl: IACMessageDefinitionObjectV3[] }>()
)

/**************** Internal ****************/

export const walletsNotMigrated = createAction(`[${featureName}] Wallets Not Migrated`)

export const shareUrlGenerated = createAction(`[${featureName}] Share URL Generated`, props<{ shareUrl: IACMessageDefinitionObjectV3[] }>())
export const shareUrlGeneratedExcludedLegacy = createAction(
  `[${featureName}] Share URL Generated (Legacy Accounts Excluded)`,
  props<{ shareUrl: IACMessageDefinitionObjectV3[] }>()
)
