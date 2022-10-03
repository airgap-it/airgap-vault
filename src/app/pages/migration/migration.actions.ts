import { ProtocolSymbols } from '@airgap/coinlib-core'
import { createAction, props } from '@ngrx/store'

import { MigrationMnemonicSecret } from './migration.types'

const featureName = 'Migration'

/**************** View Lifecycle ****************/

export const viewWillEnter = createAction(`[${featureName}] View Will Enter`)
export const viewLeft = createAction(`[${featureName}] View Left`)

/**************** Navigation Data ****************/

export const navigationDataLoading = createAction(`[${featureName}] Navigation Data Loading`)
export const navigationDataLoaded = createAction(
  `[${featureName}] Navigation Data Loaded`,
  props<{ secrets: MigrationMnemonicSecret[]; targetWalletKeys: string[], identifierToNameMap: { [identifier: string]: string } }>()
)
export const invalidData = createAction(`[${featureName}] Invalid Navigation Data`)

/**************** User Interaction ****************/

export const migrationStarted = createAction(`[${featureName}] Migration Started`)
export const finished = createAction(`[${featureName}] Finished`)

export const paranoiaAccepted = createAction(`[${featureName}] Paranoia Accepted`)
export const paranoiaRejected = createAction(`[${featureName}] Paranoia Rejected`)

export const bip39PassphraseProvided = createAction(`[${featureName}] BIP-39 Passphrase Provided`, props<{ passphrase: string }>())
export const bip39PassphraseRejected = createAction(`[${featureName}] BIP-39 Passphrase rejected`)

export const alertDismissed = createAction(`[${featureName}] Alert Dismissed`, props<{ id: string }>())

/**************** Internal ****************/

export const nextSecret = createAction(`[${featureName}] Next Secret`, props<{ id: string }>())
export const secretSkipped = createAction(`[${featureName}] Secret Skipped`, props<{ id: string }>())
export const allSecretsHandled = createAction(`[${featureName}] All Secrets Handled`)

export const nextWallet = createAction(`[${featureName}] Next Wallet`, props<{ publicKey: string }>())
export const walletSkipped = createAction(`[${featureName}] Wallet Skipped`, props<{ publicKey: string }>())
export const allWalletsHandled = createAction(`[${featureName}] All Wallets Handled`)

export const paranoiaDetected = createAction(`[${featureName}] Paranoia Detected`, props<{ secretId: string }>())
export const invalidBip39Passphrase = createAction(
  `[${featureName}] Invalid BIP-39 Passphrase`,
  props<{ protocolIdentifier: ProtocolSymbols; publicKey: string }>()
)

export const unknownError = createAction(`[${featureName}] Unknown Error`, props<{ message?: string }>())
