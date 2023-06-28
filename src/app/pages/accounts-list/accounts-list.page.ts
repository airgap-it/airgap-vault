import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { Router } from '@angular/router'
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
  public deleteView: boolean = false
  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])
  public selectedWallets: AirGapWallet[] = []
  public readonly isAndroid: boolean
  public readonly AirGapWalletStatus: typeof AirGapWalletStatus = AirGapWalletStatus

  constructor(
    private readonly platform: Platform,
    private readonly navigationService: NavigationService,
    private readonly modeService: ModeService,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly secretsService: SecretsService,
    private readonly router: Router
  ) {
    this.isAndroid = this.platform.is('android')
  }

  ionViewWillEnter() {
    this.secret = this.navigationService?.getState()?.secret
    if (this.secret) {
      this.loadWallets()
    } else {
      this.router.navigate(['/'])
      throw new Error('[AccountsListPage]: No secret found! Navigating to home page.')
    }
  }

  private async loadWallets() {
    const comparableWallets: [string, AirGapWallet][] = await Promise.all(
      [...this.secret?.wallets].map(async (wallet: AirGapWallet) => {
        return [await wallet.protocol.getName(), wallet] as [string, AirGapWallet]
      })
    )
    const sortedWallets: AirGapWallet[] = comparableWallets
      .sort((a: [string, AirGapWallet], b: [string, AirGapWallet]) => a[0].localeCompare(b[0]))
      .map(([_, wallet]: [string, AirGapWallet]) => wallet)

    this.wallets$.next(sortedWallets)
  }

  public goToReceiveAddress(wallet: AirGapWallet): void {
    this.navigationService
      .routeWithState('/account-address', { wallet: wallet, secret: this.secret })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
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

  public async presentEditPopover(event: Event): Promise<void> {
    event
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
                this.loadWallets()
              }
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }

  public onWalletSelected(wallet: AirGapWallet): void {
    if (this.selectedWallets?.includes(wallet)) {
      const index = this.selectedWallets.indexOf(wallet)
      if (index > -1) {
        this.selectedWallets = this.selectedWallets.splice(index, 1)
      }
    } else {
      this.selectedWallets.push(wallet)
    }
  }

  public async removeWallets(): Promise<void> {
    await this.secretsService.removeWallets(this.selectedWallets)
    this.loadWallets()
    this.toggleDeleteView()
  }

  toggleDeleteView() {
    this.deleteView = !this.deleteView
  }

  navigateToSecretsTab() {
    this.navigationService.routeBack('tabs/tab-secrets')
  }
}
