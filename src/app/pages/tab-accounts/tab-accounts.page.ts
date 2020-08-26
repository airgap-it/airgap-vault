import { Component, OnInit } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'
import { BehaviorSubject, Observable } from 'rxjs'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { Platform } from '@ionic/angular'
import { SecretEditAction } from '../secret-edit/secret-edit.page'

@Component({
  selector: 'airgap-tab-accounts',
  templateUrl: './tab-accounts.page.html',
  styleUrls: ['./tab-accounts.page.scss']
})
export class TabAccountsPage implements OnInit {
  public readonly secrets: Observable<Secret[]>
  public activeSecret: Secret

  public symbolFilter: string | undefined

  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  public readonly isAndroid: boolean

  constructor(
    private readonly platform: Platform,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
    this.isAndroid = this.platform.is('android')
  }

  public async ngOnInit(): Promise<void> {
    this.secretsService.getActiveSecretObservable().subscribe((secret: Secret) => {
      if (secret && secret.wallets) {
        this.activeSecret = secret
        this.wallets$.next(secret.wallets)
      }
    })

    this.secrets.subscribe(async (secrets: Secret[]) => {
      if (secrets.length === 0) {
        this.navigationService.route('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    }) // We should never unsubscribe, because we need to watch this in case a user deletes all his secrets
  }

  public goToReceiveAddress(wallet: AirGapWallet): void {
    // this.navigationService.routeWithState('/account-address', { wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    const secretId = this.activeSecret.id
    const protocol = wallet.protocolIdentifier
    const publicKey = wallet.publicKey

    this.navigationService.route(`/account-address/${secretId}/${protocol}/${publicKey}`)
  }

  public filterItems(event: any): void {
    function isValidSymbol(data: unknown): data is string {
      return data && typeof data === 'string' && data !== ''
    }

    const value: unknown = event.target.value

    this.symbolFilter = isValidSymbol(value) ? value.trim().toLowerCase() : undefined
  }

  public addWallet(): void {
    this.navigationService.route('/account-add').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public navigateToRecoverySettings() {
    this.navigationService
      .routeWithState(`/secret-edit/${this.activeSecret.id}/${'edit'}`, {
        secret: this.activeSecret,
        action: SecretEditAction.SET_RECOVERY_KEY
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
