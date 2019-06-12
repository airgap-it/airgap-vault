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

  public wallets$: BehaviorSubject<AirGapWallet[]> = new BehaviorSubject<AirGapWallet[]>([])

  constructor(private readonly secretsProvider: SecretsService, private readonly navigationService: NavigationService) {
    this.secrets = this.secretsProvider.currentSecretsList.asObservable()
    this.secretsProvider.getActiveSecretObservable().subscribe((secret: Secret) => {
      this.wallets$.next(secret.wallets)
    })
  }

  public async ngOnInit(): Promise<void> {
    await this.secretsProvider.isReady()
    this.secrets.subscribe(async (secrets: Secret[]) => {
      if (secrets.length === 0) {
        this.navigationService.route('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })
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
