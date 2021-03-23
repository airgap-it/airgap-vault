import { UIAction, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store'
import { Secret } from 'src/app/models/secret'

import * as fromRoot from '../../app.reducers'
import * as actions from './account-share-select.actions'
import { Alert } from './account-share.types'

/**************** STATE ****************/

export interface FeatureState {
  // TODO: move secrets to a global state
  secrets: UIResource<Secret[]>
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
    checkedIds: secrets.map((secret: Secret) => secret.id)
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
  })
)

/**************** Selectors ****************/

export const selectFeatureState = createFeatureSelector<State, FeatureState>('accountShareSelect')

export const selectSecrets = createSelector(
  selectFeatureState,
  (state: FeatureState): UIResource<Secret[]> => ({
    status: state.secrets.status,
    value: state.secrets.value?.filter((secret: Secret) => secret.wallets.length > 0)
  })
)
export const selectCheckedIds = createSelector(selectFeatureState, (state: FeatureState): string[] => state.checkedIds)

export const selectCheckedSecrets = createSelector(
  selectSecrets,
  selectCheckedIds,
  (secrets: UIResource<Secret[]>, checked: string[]): Secret[] => {
    if (secrets.value === undefined || secrets.value.length === 0) {
      return []
    }

    const checkedSet: Set<string> = new Set(checked)

    return secrets.value.filter((secret: Secret) => checkedSet.has(secret.id))
  }
)
export const selectIsSecretChecked = createSelector(
  selectSecrets,
  selectCheckedIds,
  (secrets: UIResource<Secret[]>, checked: string[]): Record<string, boolean> => {
    if (secrets.value === undefined || secrets.value.length === 0) {
      return {}
    }

    const checkedSet: Set<string> = new Set(checked)

    return secrets.value.reduce(
      (record: Record<string, boolean>, next: Secret) => Object.assign(record, { [next.id]: checkedSet.has(next.id) }),
      {}
    )
  }
)
