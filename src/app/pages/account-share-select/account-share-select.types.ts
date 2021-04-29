import { InteractionSetting } from '../../services/interaction/interaction.service'

/**************** Alert ****************/
export interface WalletsNotMigratedAlert {
  type: 'walletsNotMigrated'
}

export interface ExcludedLegacyAccountsAlert {
  type: 'excludedLegacyAccounts'
  shareUrl: string
  interactionSetting: InteractionSetting
}

export interface UnknownErrorAlert {
  type: 'unknownError'
  message?: string
}

export type Alert = WalletsNotMigratedAlert | ExcludedLegacyAccountsAlert | UnknownErrorAlert
