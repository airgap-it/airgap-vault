import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { AlertController, Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject } from 'rxjs'
import { first } from 'rxjs/operators'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { ModeService } from 'src/app/services/mode/mode.service'
import { ModeStrategy } from 'src/app/services/mode/strategy/ModeStrategy'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { SecretEditAction } from '../secret-edit/secret-edit.page'

@Component({
  selector: 'airgap-accounts-list',
  templateUrl: './accounts-list.page.html',
  styleUrls: ['./accounts-list.page.scss']
})
export class AccountsListPage {
  public secret: MnemonicSecret

  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  public readonly isAndroid: boolean

  public readonly AirGapWalletStatus: typeof AirGapWalletStatus = AirGapWalletStatus

  constructor(
    private readonly platform: Platform,
    private readonly navigationService: NavigationService,
    private readonly modeService: ModeService,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly secretsService: SecretsService
  ) {
    this.isAndroid = this.platform.is('android')
  }

  ionViewWillEnter() {
    this.secret = this.navigationService.getState().secret
    this.wallets$.next([...this.secret?.wallets].sort((a, b) => a.protocol.name.localeCompare(b.protocol.name)))
  }

  public goToReceiveAddress(wallet: AirGapWallet): void {
    this.navigationService.routeWithState('/account-address', { wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async syncWallets(): Promise<void> {
    const strategy: ModeStrategy = await this.modeService.strategy()
    await strategy.syncAll()
  }

  public addWallet(): void {
    this.navigationService.routeWithState('/account-add', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToEditSecret(secret: MnemonicSecret): void {
    this.navigationService.routeWithState('/secret-edit', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public navigateToRecoverySettings() {
    this.navigationService
      .routeWithState('/secret-edit', {
        secret: this.secret,
        action: SecretEditAction.SET_RECOVERY_KEY
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public delete(wallet: AirGapWallet): void {
    this.translateService
      .get([
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        'wallet-edit-delete-popover.account-removal_alert.delete_label'
      ])
      .pipe(first())
      .subscribe(async (values: string[]) => {
        const title: string = values['wallet-edit-delete-popover.account-removal_alert.title']
        const message: string = values['wallet-edit-delete-popover.account-removal_alert.text']
        const cancelButton: string = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
        const deleteButton: string = values['wallet-edit-delete-popover.account-removal_alert.delete_label']

        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: title,
          message,
          buttons: [
            {
              text: cancelButton,
              role: 'cancel'
            },
            {
              text: deleteButton,
              handler: (): void => {
                this.secretsService.removeWallet(wallet).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
                this.wallets$.next([...this.secret?.wallets].sort((a, b) => a.protocol.name.localeCompare(b.protocol.name)))
              }
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }
}
