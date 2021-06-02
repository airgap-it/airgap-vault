import { UiEventService } from '@airgap/angular-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { first } from 'rxjs/operators'

import { Secret } from '../../../models/secret'
import { InteractionOperationType, InteractionService, InteractionSetting } from '../../interaction/interaction.service'
import { MigrationService } from '../../migration/migration.service'
import { SecretsService } from '../../secrets/secrets.service'
import { ShareUrlService } from '../../share-url/share-url.service'

import { ModeStrategy } from './ModeStrategy'

@Injectable({
  providedIn: 'root'
})
export class BasicModeSerivce implements ModeStrategy {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly migrationService: MigrationService,
    private readonly uiEventService: UiEventService
  ) {}

  public async syncAll(): Promise<void> {
    const secrets: Secret[] = await this.secretsService.getSecretsObservable().pipe(first()).toPromise()
    await this.migrationService.runSecretsMigration(secrets)
    const [migratedSecrets, allMigrated]: [Secret[], boolean] = this.migrationService.deepFilterMigratedSecretsAndWallets(secrets)
    if (migratedSecrets.length === 0) {
      await this.showNoMigratedWalletsAlert()
      return
    }

    const shareUrl: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareSecretsURL(migratedSecrets)
    const interactionSetting: InteractionSetting = this.interactionService.getCommonInteractionSetting(migratedSecrets)

    if (allMigrated) {
      this.syncAccounts(shareUrl, interactionSetting)
    } else {
      await this.showExcludedLegacyAccountsAlert(shareUrl, interactionSetting)
    }
  }

  private syncAccounts(shareUrl: IACMessageDefinitionObjectV3[], interactionSetting: InteractionSetting): void {
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        iacMessage: shareUrl // JGD rename shareUrl
      },
      interactionSetting
    )
  }

  private async showNoMigratedWalletsAlert(): Promise<void> {
    await this.uiEventService.showTranslatedAlert({
      header: 'wallet-share-select.alert.wallets-not-migrated.header',
      message: 'wallet-share-select.alert.wallets-not-migrated.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'wallet-share-select.alert.wallets-not-migrated.button_label'
        }
      ]
    })
  }

  private async showExcludedLegacyAccountsAlert(
    shareUrl: IACMessageDefinitionObjectV3[],
    interactionSetting: InteractionSetting
  ): Promise<void> {
    await this.uiEventService.showTranslatedAlert({
      header: 'wallet-share-select.alert.excluded-legacy-accounts.header',
      message: 'wallet-share-select.alert.excluded-legacy-accounts.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'wallet-share-select.alert.excluded-legacy-accounts.button-reject_label'
        },
        {
          text: 'wallet-share-select.alert.excluded-legacy-accounts.button-accept_label',
          handler: () => {
            this.syncAccounts(shareUrl, interactionSetting)
          }
        }
      ]
    })
  }
}
