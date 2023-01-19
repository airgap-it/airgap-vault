
import { createAction, props } from '@ngrx/store'
import { ProtocolModuleMetadata } from 'src/app/services/protocol-module/protocol-module.service'

const featureName = 'Module Preview'

/**************** View Lifecycle ****************/

export const viewInitialization = createAction(`[${featureName}] View Initialization`)

/**************** Navigation Data ****************/

export const navigationDataLoading = createAction(`[${featureName}] Navigation Data Loading`)
export const navigationDataLoaded = createAction(
  `[${featureName}] Navigation Data Loaded`,
  props<{ metadata: ProtocolModuleMetadata }>()
)
export const invalidData = createAction(`[${featureName}] Invalid Navigation Data`)

/**************** User Interaction ****************/

export const installModule = createAction(`[${featureName}] Install Module`, props<{ metadata: ProtocolModuleMetadata }>())
export const moduleInstalling = createAction(`[${featureName}] Module Installing`)
export const moduleInstalled = createAction(`[${featureName}] Module Installed`)
export const moduleFailedToInstall = createAction(`[${featureName}] Module Failed to Install`)