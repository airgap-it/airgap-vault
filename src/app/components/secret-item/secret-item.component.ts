import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

import { MnemonicSecret } from '../../models/secret'

@Component({
  selector: 'airgap-secret-item',
  templateUrl: './secret-item.component.html',
  styleUrls: ['./secret-item.component.scss']
})
export class SecretItemComponent implements OnInit {
  @Input()
  public secret: MnemonicSecret

  public activeWallets: string[]
  public hasMoreWallets: number = 0

  constructor(private readonly secretsService: SecretsService, public navigationService: NavigationService) {}

  public ngOnInit() {
    this.secretsService.getActiveSecretObservable().subscribe((secret: MnemonicSecret) => {
      if (secret && secret.wallets) {
        this.getWalletsFromSecret()
      }
    })

    this.getWalletsFromSecret()
  }

  public getWalletsFromSecret() {
    this.activeWallets = this.secret.wallets
      .filter((wallet) => wallet.status === AirGapWalletStatus.ACTIVE)
      .sort((a, b) => a.protocol.name.localeCompare(b.protocol.name)) // TODO: Use same order as common lib
      .map((wallet) => wallet.protocol.symbol)

    if (this.activeWallets.length > 10) {
      this.hasMoreWallets = this.activeWallets.length - 10
      this.activeWallets = this.activeWallets.slice(0, 10)
    } else {
      this.hasMoreWallets = 0
    }
  }

  public goToEditSecret(): void {
    this.navigationService.routeWithState('/secret-edit', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToAccountsList(): void {
    this.navigationService.routeWithState('/accounts-list', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
