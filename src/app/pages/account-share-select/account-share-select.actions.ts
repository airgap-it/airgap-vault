import { createAction, props } from '@ngrx/store'

import { Secret } from '../../models/secret'
import { InteractionSetting } from '../../services/interaction/interaction.service'

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
  props<{ shareUrl: string; interactionSetting: InteractionSetting }>()
)

/**************** Internal ****************/

export const walletsNotMigrated = createAction(`[${featureName}] Wallets Not Migrated`)

export const shareUrlGenerated = createAction(
  `[${featureName}] Share URL Generated`,
  props<{ shareUrl: string; interactionSetting: InteractionSetting }>()
)
export const shareUrlGeneratedExcludedLegacy = createAction(
  `[${featureName}] Share URL Generated (Legacy Accounts Excluded)`,
  props<{ shareUrl: string; interactionSetting: InteractionSetting }>()
)
