import { UIAction, UIActionStatus, UiEventService, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { Component, OnDestroy } from '@angular/core'
import { AlertOptions } from '@ionic/core'
import { Store } from '@ngrx/store'
import { Observable, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

import * as actions from './account-share-select.actions'
import * as fromAccountShareSelect from './account-share-select.reducers'
import { Alert } from './account-share-select.types'

@Component({
  selector: 'airgap-account-share-select',
  templateUrl: './account-share-select.page.html',
  styleUrls: ['./account-share-select.page.scss']
})
export class AccountShareSelectPage implements OnDestroy {
  public readonly secrets$: Observable<UIResource<MnemonicSecret[]>>
  public readonly isChecked$: Observable<Record<string, boolean>>

  public readonly syncEnabled$: Observable<boolean>

  public readonly alert$: Observable<UIAction<Alert> | undefined>

  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus
  public readonly AirGapWalletStatus: typeof AirGapWalletStatus = AirGapWalletStatus

  private alertElement: HTMLIonAlertElement

  private readonly ngDestroyed$: Subject<void> = new Subject()

  constructor(private readonly store: Store<fromAccountShareSelect.State>, private readonly uiEventService: UiEventService) {
    this.secrets$ = this.store.select(fromAccountShareSelect.selectSecrets)
    this.isChecked$ = this.store.select(fromAccountShareSelect.selectIsSecretChecked)

    this.syncEnabled$ = this.store.select(fromAccountShareSelect.selectSyncEnabled)

    this.alert$ = this.store.select(fromAccountShareSelect.selectAlert)

    this.alert$.pipe(takeUntil(this.ngDestroyed$)).subscribe(this.showOrDismissAlert.bind(this))

    this.store.dispatch(actions.viewInitialization())
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next()
    this.ngDestroyed$.complete()
  }

  public toggleSecret(secret: MnemonicSecret): void {
    this.store.dispatch(actions.secretToggled({ secretId: secret.id }))
  }

  public sync(): void {
    this.store.dispatch(actions.syncButtonClicked())
  }

  private async showOrDismissAlert(alert: UIAction<Alert> | undefined): Promise<void> {
    this.alertElement?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    if (alert?.status === UIActionStatus.PENDING) {
      this.alertElement = await this.uiEventService.getTranslatedAlert(this.getAlertData(alert.value))
      this.alertElement.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))

      return this.alertElement
        .onWillDismiss()
        .then(() => {
          this.store.dispatch(actions.alertDismissed({ id: alert.id }))
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    } else {
      this.alertElement = undefined
    }
  }

  private getAlertData(alert: Alert): AlertOptions {
    switch (alert.type) {
      case 'walletsNotMigrated':
        return this.walletsNotMigratedAlert()
      case 'excludedLegacyAccounts':
        return this.excludedLegacyAccountsAlert(alert.shareUrl)
      case 'unknownError':
        return this.unknownErrorAlert(alert.message)
      default:
        return {}
    }
  }

  private walletsNotMigratedAlert(): AlertOptions {
    return {
      header: 'wallet-share-select.alert.wallets-not-migrated.header',
      message: 'wallet-share-select.alert.wallets-not-migrated.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'wallet-share-select.alert.wallets-not-migrated.button_label'
        }
      ]
    }
  }

  private excludedLegacyAccountsAlert(shareUrl: IACMessageDefinitionObjectV3[]): AlertOptions {
    return {
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
            this.store.dispatch(actions.migrationAlertAccepted({ shareUrl }))
          }
        }
      ]
    }
  }

  private unknownErrorAlert(message?: string): AlertOptions {
    return {
      header: 'wallet-share-select.alert.unknown-error.header',
      message: message ?? 'wallet-share-select.alert.unknown-error.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'wallet-share-select.alert.unknown-error.button_label'
        }
      ]
    }
  }
}
