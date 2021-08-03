import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

import { Secret } from '../../models/secret'
import { InteractionSetting } from '../../services/interaction/interaction.service'

@Component({
  selector: 'airgap-secret-item',
  templateUrl: './secret-item.component.html',
  styleUrls: ['./secret-item.component.scss']
})
export class SecretItemComponent implements OnInit {
  @Input()
  public secret: Secret

  public activeWallets: string[]
  public hasMoreWallets: number = 0

  public interactionSetting: typeof InteractionSetting = InteractionSetting

  constructor(private readonly secretsService: SecretsService) {}

  public ngOnInit() {
    this.secretsService.getActiveSecretObservable().subscribe((secret: Secret) => {
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

    if (this.activeWallets.length > 5) {
      this.hasMoreWallets = this.activeWallets.length - 5
      this.activeWallets = this.activeWallets.slice(0, 5)
    } else {
      this.hasMoreWallets = 0
    }
  }
}
