import { UiEventService } from '@airgap/angular-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { Injectable } from '@angular/core'
import { first } from 'rxjs/operators'

import { MnemonicSecret } from '../../../models/secret'
import { InteractionOperationType, InteractionService } from '../../interaction/interaction.service'
import { MigrationService } from '../../migration/migration.service'
import { SecretsService } from '../../secrets/secrets.service'
import { ShareUrlService } from '../../share-url/share-url.service'

import { ModeStrategy } from './ModeStrategy'

@Injectable({
  providedIn: 'root'
})
export class BasicModeService implements ModeStrategy {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly migrationService: MigrationService,
    private readonly uiEventService: UiEventService
  ) {}

  public async syncAll(): Promise<void> {
    const secrets: MnemonicSecret[] = await this.secretsService.getSecretsObservable().pipe(first()).toPromise()
    await this.migrationService.runSecretsMigration(secrets)
    const [migratedSecrets, allMigrated]: [MnemonicSecret[], boolean] = await this.migrationService.deepFilterMigratedSecretsAndWallets(secrets)
    if (migratedSecrets.length === 0) {
      await this.showNoMigratedWalletsAlert()
      return
    }

    const shareUrl: IACMessageDefinitionObjectV3[] = await this.shareUrlService.generateShareSecretsURL(migratedSecrets)

    if (allMigrated) {
      this.syncAccounts(shareUrl)
    } else {
      await this.showExcludedLegacyAccountsAlert(shareUrl)
    }
  }

  private syncAccounts(shareUrl: IACMessageDefinitionObjectV3[]): void {
    this.interactionService.startInteraction({
      operationType: InteractionOperationType.WALLET_SYNC,
      iacMessage: shareUrl // JGD rename shareUrl
    })
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

  private async showExcludedLegacyAccountsAlert(shareUrl: IACMessageDefinitionObjectV3[]): Promise<void> {
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
            this.syncAccounts(shareUrl)
          }
        }
      ]
    })
  }
}
