import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component, OnInit } from '@angular/core'
import { Platform } from '@ionic/angular'
import { BehaviorSubject } from 'rxjs'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { ModeService } from 'src/app/services/mode/mode.service'
import { ModeStrategy } from 'src/app/services/mode/strategy/ModeStrategy'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecretEditAction } from '../secret-edit/secret-edit.page'

@Component({
  selector: 'airgap-accounts-list',
  templateUrl: './accounts-list.page.html',
  styleUrls: ['./accounts-list.page.scss']
})
export class AccountsListPage implements OnInit {
  public secret: MnemonicSecret

  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  public readonly isAndroid: boolean

  public readonly AirGapWalletStatus: typeof AirGapWalletStatus = AirGapWalletStatus

  constructor(
    private readonly platform: Platform,
    private readonly navigationService: NavigationService,
    private readonly modeService: ModeService
  ) {
    this.secret = this.navigationService.getState().secret
    this.wallets$.next([...this.secret.wallets].sort((a, b) => a.protocol.name.localeCompare(b.protocol.name)))
    this.isAndroid = this.platform.is('android')
  }

  public async ngOnInit(): Promise<void> {
    // TODO JGD?
    //
    // TODO: MOVE THIS TO SECRETS TAB
    // this.secrets.subscribe(async (secrets: Secret[]) => {
    //   if (secrets.length === 0) {
    //     this.navigationService.route('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    //   }
    // }) // We should never unsubscribe, because we need to watch this in case a user deletes all his secrets
    // TODO: The following is potentially old code
    // this.secretsService.getActiveSecretObservable().subscribe((secret: MnemonicSecret) => {
    //   if (secret && secret.wallets) {
    //     this.activeSecret = secret
    //     this.wallets$.next([...secret.wallets])
    //   }
    // })
    // this.secrets.subscribe(async (secrets: MnemonicSecret[]) => {
    //   if (secrets.length === 0) {
    //     this.navigationService.route('/secret-setup/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    //   }
    // }) // We should never unsubscribe, because we need to watch this in case a user deletes all his secrets
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
}
