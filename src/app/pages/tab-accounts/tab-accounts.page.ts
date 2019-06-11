import { Component, OnInit } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'
import { BehaviorSubject, Observable } from 'rxjs'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-tab-accounts',
  templateUrl: './tab-accounts.page.html',
  styleUrls: ['./tab-accounts.page.scss']
})
export class TabAccountsPage implements OnInit {
  public readonly secrets: Observable<Secret[]>

  public symbolFilter: string | undefined
  public activeSecret: Secret

  public wallets: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  constructor(private readonly secretsProvider: SecretsService, private readonly navigationService: NavigationService) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
  }

  public ngOnInit(): void {
    this.secrets.subscribe(async (secrets: Secret[]) => {
      if (secrets.length === 0) {
        this.navigationService.route('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })

    if (this.secretsProvider.getActiveSecret()) {
      this.activeSecret = this.secretsProvider.getActiveSecret()
      this.wallets.next(this.activeSecret.wallets)
    }
  }

  public onSecretChanged(secret: Secret): void {
    this.activeSecret = secret
    this.wallets.next(this.activeSecret.wallets)
  }

  public goToReceiveAddress(wallet: AirGapWallet): void {
    this.navigationService.routeWithState('/account-address', { wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
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
}
