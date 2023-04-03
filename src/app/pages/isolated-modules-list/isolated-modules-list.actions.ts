
import { IsolatedModuleMetadata } from '@airgap/angular-core'
import { createAction, props } from '@ngrx/store'

const featureName = 'Isolated Modules Onboarding'

/**************** View Lifecycle ****************/

export const viewInitialization = createAction(`[${featureName}] View Initialization`)

/**************** Navigation Data ****************/

export const navigationDataLoading = createAction(`[${featureName}] Navigation Data Loading`)
export const navigationDataLoaded = createAction(
  `[${featureName}] Navigation Data Loaded`,
  props<{ metadata: IsolatedModuleMetadata }>()
)
export const invalidData = createAction(`[${featureName}] Invalid Navigation Data`)

/**************** User Interaction ****************/

export const installModule = createAction(`[${featureName}] Install Module`, props<{ metadata: IsolatedModuleMetadata }>())
export const moduleInstalling = createAction(`[${featureName}] Module Installing`)
export const moduleInstalled = createAction(`[${featureName}] Module Installed`)
export const moduleFailedToInstall = createAction(`[${featureName}] Module Failed to Install`)