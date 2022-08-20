import { generateGUID, UIAction, UIActionStatus, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store'

import * as fromRoot from '../../app.reducers'
import { MnemonicSecret } from '../../models/secret'

import * as actions from './account-share-select.actions'
import { Alert, ExcludedLegacyAccountsAlert, WalletsNotMigratedAlert } from './account-share-select.types'

/**************** STATE ****************/

export interface FeatureState {
  // TODO: move secrets to a global state
  secrets: UIResource<MnemonicSecret[]>
  checkedIds: string[]

  alert: UIAction<Alert> | undefined
}

export interface State extends fromRoot.State {
  accountShareSelect: FeatureState
}

/**************** Reducers ****************/

export const initialState: FeatureState = {
  secrets: {
    status: UIResourceStatus.IDLE,
    value: []
  },
  checkedIds: [],

  alert: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.initialDataLoaded, (state, { secrets }) => ({
    ...state,
    secrets: {
      status: UIResourceStatus.SUCCESS,
      value: secrets
    },
    checkedIds: secrets.map((secret: MnemonicSecret) => secret.id)
  })),
  on(actions.secretToggled, (state, { secretId }) => {
    const foundIndex: number = state.checkedIds.indexOf(secretId)

    return {
      ...state,
      checkedIds:
        foundIndex > -1
          ? state.checkedIds.slice(0, foundIndex).concat(state.checkedIds.slice(foundIndex + 1))
          : [...state.checkedIds, secretId]
    }
  }),
  on(actions.walletsNotMigrated, (state) => ({
    ...state,
    alert: {
      id: generateGUID(),
      value: { type: 'walletsNotMigrated' as WalletsNotMigratedAlert['type'] },
      status: UIActionStatus.PENDING
    }
  })),
  on(actions.shareUrlGeneratedExcludedLegacy, (state, { shareUrl }) => ({
    ...state,
    alert: {
      id: generateGUID(),
      value: {
        type: 'excludedLegacyAccounts' as ExcludedLegacyAccountsAlert['type'],
        shareUrl
      },
      status: UIActionStatus.PENDING
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
        : undefined
  }))
)

/**************** Selectors ****************/

export const selectFeatureState = createFeatureSelector<State, FeatureState>('accountShareSelect')

export const selectSecrets = createSelector(
  selectFeatureState,
  (state: FeatureState): UIResource<MnemonicSecret[]> => ({
    status: state.secrets.status,
    value: state.secrets.value?.filter((secret: MnemonicSecret) => secret.wallets.length > 0)
  })
)
export const selectCheckedIds = createSelector(selectFeatureState, (state: FeatureState): string[] => state.checkedIds)
export const selectAlert = createSelector(selectFeatureState, (state: FeatureState): UIAction<Alert> | undefined => state.alert)

export const selectCheckedSecrets = createSelector(
  selectSecrets,
  selectCheckedIds,
  (secrets: UIResource<MnemonicSecret[]>, checked: string[]): MnemonicSecret[] => {
    if (secrets.value === undefined || secrets.value.length === 0) {
      return []
    }

    const checkedSet: Set<string> = new Set(checked)

    return secrets.value.filter((secret: MnemonicSecret) => checkedSet.has(secret.id))
  }
)
export const selectIsSecretChecked = createSelector(
  selectSecrets,
  selectCheckedIds,
  (secrets: UIResource<MnemonicSecret[]>, checked: string[]): Record<string, boolean> => {
    if (secrets.value === undefined || secrets.value.length === 0) {
      return {}
    }

    const checkedSet: Set<string> = new Set(checked)

    return secrets.value.reduce(
      (record: Record<string, boolean>, next: MnemonicSecret) => Object.assign(record, { [next.id]: checkedSet.has(next.id) }),
      {}
    )
  }
)

export const selectSyncEnabled = createSelector(selectCheckedIds, (checked: string[]): boolean => checked.length > 0)
