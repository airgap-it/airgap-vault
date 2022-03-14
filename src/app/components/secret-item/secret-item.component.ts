import { AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'
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

  public lifehashData: string = ''

  constructor(private readonly secretsService: SecretsService, private readonly lifehashService: LifehashService) {}

  public async ngOnInit() {
    this.secretsService.getActiveSecretObservable().subscribe((secret: MnemonicSecret) => {
      if (secret && secret.wallets) {
        this.getWalletsFromSecret()
      }
    })

    this.getWalletsFromSecret()

    this.lifehashData = await this.lifehashService.generateLifehash(this.secret.fingerprint)
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
