import { ActionReducer, MetaReducer } from '@ngrx/store'
import { environment } from 'src/environments/environment'

export interface State {}

export const reducers = {}

function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    const newState = reducer(state, action)
    console.groupCollapsed(action.type)
    console.log('previous state', state)
    console.log('action', action)
    console.log('next state', newState)
    console.groupEnd()

    return newState
  }
}
export const metaReducers: MetaReducer<State>[] = !environment.production ? [logger] : []
