/**************** STATE ****************/

import { generateGUID, UIAction, UIActionStatus, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { AirGapWallet } from '@airgap/coinlib-core'
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store'

import * as fromRoot from '../../app.reducers'
import { MnemonicSecret } from '../../models/secret'

import * as actions from './migration.actions'
import { Alert, Bip39PassphraseAlert, MigrationMnemonicSecret, MigrationWallet, MigrationWalletGroup, ParanoiaInfoAlert, UnknownErrorAlert } from './migration.types'
import { getWalletGroupMigrationStatus, getWalletMigrationStatus } from './migration.utils'

export interface FeatureState {
  targetSecrets: UIResource<MigrationMnemonicSecret[]>
  targetWalletKeys: string[]

  identifierToNameMap: { [identifier: string]: string }

  handledSecretIds: string[]
  handledWalletKeys: string[]

  currentlyHandledSecretId: string | undefined
  currentlyHandledWalletKey: string | undefined

  alert: UIAction<Alert> | undefined
}

export interface State extends fromRoot.State {
  migration: FeatureState
}

/**************** Reducers ****************/

export const initialState: FeatureState = {
  targetSecrets: {
    status: UIResourceStatus.IDLE,
    value: []
  },
  targetWalletKeys: [],

  identifierToNameMap: {},

  handledSecretIds: [],
  handledWalletKeys: [],

  currentlyHandledSecretId: undefined,
  currentlyHandledWalletKey: undefined,

  alert: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.navigationDataLoading, (state) => ({
    ...state,
    targetSecrets: {
      status: UIResourceStatus.LOADING,
      value: state.targetSecrets.value
    }
  })),
  on(actions.navigationDataLoaded, (state, { secrets, targetWalletKeys, identifierToNameMap }) => ({
    ...state,
    targetSecrets: {
      status: UIResourceStatus.SUCCESS,
      value: secrets
    },
    targetWalletKeys,

    identifierToNameMap,

    handledSecretIds: [],
    handledWalletKeys: [],

    currentlyHandledSecretId: undefined,
    currentlyHandledWalletKey: undefined,

    alert: undefined
  })),
  on(actions.invalidData, (state) => ({
    ...state,
    targetSecrets: {
      status: UIResourceStatus.ERROR,
      value: state.targetSecrets.value
    }
  })),
  on(actions.nextSecret, (state, { id }) => ({
    ...state,
    handledSecretIds:
      state.currentlyHandledSecretId !== undefined ? [...state.handledSecretIds, state.currentlyHandledSecretId] : state.handledSecretIds,
    currentlyHandledSecretId: id
  })),
  on(actions.secretSkipped, (state, { id }) => {
    const secret: MnemonicSecret | undefined = state.targetSecrets.value?.find((secret: MigrationMnemonicSecret) => secret.wrapped.id === id)?.wrapped

    return {
      ...state,
      handledWalletKeys: state.handledWalletKeys.concat(secret?.wallets.map((wallet: AirGapWallet) => wallet.publicKey) ?? [])
    }
  }),
  on(actions.allSecretsHandled, (state) => ({
    ...state,
    handledSecretIds:
      state.currentlyHandledSecretId !== undefined ? [...state.handledSecretIds, state.currentlyHandledSecretId] : state.handledSecretIds,
    currentlyHandledSecretId: undefined
  })),
  on(actions.nextWallet, (state, { publicKey }) => ({
    ...state,
    handledWalletKeys:
      state.currentlyHandledWalletKey !== undefined
        ? [...state.handledWalletKeys, state.currentlyHandledWalletKey]
        : state.handledWalletKeys,
    currentlyHandledWalletKey: publicKey
  })),
  on(actions.allWalletsHandled, (state) => ({
    ...state,
    handledWalletKeys:
      state.currentlyHandledWalletKey !== undefined
        ? [...state.handledWalletKeys, state.currentlyHandledWalletKey]
        : state.handledWalletKeys,
    currentlyHandledWalletKey: undefined
  })),
  on(actions.paranoiaDetected, (state, { secretId }) => {
    const secret: MnemonicSecret | undefined = state.targetSecrets.value?.find((secret: MigrationMnemonicSecret) => secret.wrapped.id === secretId)?.wrapped

    return {
      ...state,
      alert:
        secret !== undefined
          ? {
              id: generateGUID(),
              value: {
                type: 'paranoiaInfo' as ParanoiaInfoAlert['type'],
                label: secret.label
              },
              status: UIActionStatus.PENDING
            }
          : state.alert
    }
  }),
  on(actions.invalidBip39Passphrase, (state, { protocolIdentifier, publicKey }) => {
    let wallet: AirGapWallet | undefined
    for (const secret of state.targetSecrets.value ?? []) {
      wallet = (secret.walletsGrouped[protocolIdentifier] ?? {})[publicKey]
      if (wallet !== undefined) {
        break
      }
    }

    return {
      ...state,
      alert:
        wallet !== undefined
          ? {
              id: generateGUID(),
              value: {
                type: 'bip39Passphrase' as Bip39PassphraseAlert['type'],
                protocolName: state.identifierToNameMap[protocolIdentifier] ?? protocolIdentifier,
                address: wallet.receivingPublicAddress
              },
              status: UIActionStatus.PENDING
            }
          : state.alert
    }
  }),
  on(actions.unknownError, (state, { message }) => ({
    ...state,
    alert: {
      id: generateGUID(),
      value: {
        type: 'unknownError' as UnknownErrorAlert['type'],
        message: message?.length > 0 ? message : undefined
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

export const selectFeatureState = createFeatureSelector<State, FeatureState>('migration')

export const selectTargetSecrets = createSelector(
  selectFeatureState,
  (state: FeatureState): UIResource<MnemonicSecret[]> => ({
    status: state.targetSecrets.status,
    value: state.targetSecrets.value?.map((secret: MigrationMnemonicSecret) => secret.wrapped)
  })
)
export const selectTargetWalletKeys = createSelector(selectFeatureState, (state: FeatureState): string[] => state.targetWalletKeys)
export const selectHandledSecretIds = createSelector(selectFeatureState, (state: FeatureState): string[] => state.handledSecretIds)
export const selectHandledWalletKeys = createSelector(selectFeatureState, (state: FeatureState): string[] => state.handledWalletKeys)
export const selectCurrentlyHandledSecretId = createSelector(
  selectFeatureState,
  (state: FeatureState): string | undefined => state.currentlyHandledSecretId
)
export const selectCurrentlyHandledWalletKey = createSelector(
  selectFeatureState,
  (state: FeatureState): string | undefined => state.currentlyHandledWalletKey
)
export const selectAlert = createSelector(selectFeatureState, (state: FeatureState): UIAction<Alert> | undefined => state.alert)

export const selectMigrationWalletGroups = createSelector(
  selectTargetSecrets,
  selectTargetWalletKeys,
  selectHandledWalletKeys,
  selectCurrentlyHandledSecretId,
  selectCurrentlyHandledWalletKey,
  (
    targetSecrets: UIResource<MnemonicSecret[]>,
    targetWalletKeys: string[],
    handledWalletKeys: string[],
    currentlyHandledSecretId: string | undefined,
    currentlyHandledWalletKey: string | undefined
  ): UIResource<MigrationWalletGroup[]> => {
    const groups: MigrationWalletGroup[] = []

    if (targetSecrets.value !== undefined && targetSecrets.value.length > 0) {
      const targetWalletKeysSet: Set<string> = new Set(targetWalletKeys)
      const handledWalletKeysSet: Set<string> = new Set(handledWalletKeys)

      for (const secret of targetSecrets.value) {
        const wallets: MigrationWallet[] = secret.wallets
          .filter((wallet: AirGapWallet) => targetWalletKeysSet.has(wallet.publicKey))
          .map((wallet: AirGapWallet) => ({
            status: getWalletMigrationStatus(wallet, { currentlyHandled: currentlyHandledWalletKey, alreadyHandled: handledWalletKeysSet }),
            data: wallet
          }))

        groups.push({
          id: secret.id,
          label: secret.label,
          status: getWalletGroupMigrationStatus(secret, wallets, { currentlyHandled: currentlyHandledSecretId }),
          wallets
        })
      }
    }

    return {
      status: targetSecrets.status,
      value: groups
    }
  }
)

export const selectIsRunning = createSelector(
  selectCurrentlyHandledSecretId,
  selectCurrentlyHandledWalletKey,
  (currentlyHandledSecretId: string | undefined, currentlyHandledWalletKey: string | undefined): boolean =>
    currentlyHandledSecretId !== undefined || currentlyHandledWalletKey !== undefined
)

export const selectIsDone = createSelector(
  selectTargetSecrets,
  selectTargetWalletKeys,
  selectHandledSecretIds,
  selectHandledWalletKeys,
  selectCurrentlyHandledSecretId,
  selectCurrentlyHandledWalletKey,
  (
    targetSecrets: UIResource<MnemonicSecret[]>,
    targetWalletKeys: string[],
    handledSecretIds: string[],
    handledWalletKeys: string[],
    currentlyHandledSecretId: string | undefined,
    currentlyHandledWalletKey: string | undefined
  ): boolean =>
    handledSecretIds.length >= (targetSecrets.value?.length ?? 0) &&
    handledWalletKeys.length >= targetWalletKeys.length &&
    currentlyHandledSecretId === undefined &&
    currentlyHandledWalletKey === undefined
)
