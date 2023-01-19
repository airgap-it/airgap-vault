import { UIResource, UIResourceStatus } from '@airgap/angular-core'
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store'

import { ProtocolModuleMetadata } from '../../../app/services/protocol-module/protocol-module.service'
import * as fromRoot from '../../app.reducers'

import * as actions from './module-preview.actions'

/**************** State ****************/

export interface FeatureState {
  moduleMetadata: UIResource<ProtocolModuleMetadata>
}

export interface State extends fromRoot.State {
  modulePreview: FeatureState
}

/**************** Reducers ****************/

const initialState: FeatureState = {
  moduleMetadata: {
    value: undefined,
    status: UIResourceStatus.IDLE
  }
}

export const reducer = createReducer(
  initialState,
  on(actions.navigationDataLoading, (state) => ({
    ...state,
    moduleMetadata: {
      value: state.moduleMetadata.value,
      status: UIResourceStatus.LOADING
    }
  })),
  on(actions.navigationDataLoaded, (state, { metadata }) => ({
    ...state,
    moduleMetadata: {
      value: metadata,
      status: UIResourceStatus.SUCCESS
    }
  })),
  on(actions.invalidData, (state) => ({
    ...state,
    moduleMetadata: {
      value: state.moduleMetadata.value,
      status: UIResourceStatus.ERROR
    }
  }))
)

/**************** Selectors ****************/

export const selectFeatureState = createFeatureSelector<State, FeatureState>('modulePreview')

export const selectModuleMetadata = createSelector(selectFeatureState, (state: FeatureState): FeatureState['moduleMetadata'] => state.moduleMetadata)