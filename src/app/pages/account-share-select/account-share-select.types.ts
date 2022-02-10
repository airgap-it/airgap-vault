import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'

/**************** Alert ****************/
export interface WalletsNotMigratedAlert {
  type: 'walletsNotMigrated'
}

export interface ExcludedLegacyAccountsAlert {
  type: 'excludedLegacyAccounts'
  shareUrl: IACMessageDefinitionObjectV3[]
}

export interface UnknownErrorAlert {
  type: 'unknownError'
  message?: string
}

export type Alert = WalletsNotMigratedAlert | ExcludedLegacyAccountsAlert | UnknownErrorAlert
