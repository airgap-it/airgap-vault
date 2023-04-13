import { flattened } from '@airgap/angular-core'
import { AirGapWallet, AirGapWalletStatus, MainProtocolSymbols } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

import { MnemonicSecret } from '../../models/secret'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-select-account',
  templateUrl: './select-account.page.html',
  styleUrls: ['./select-account.page.scss']
})
export class SelectAccountPage {
  public title: string
  public heading: string
  public placeholder: string

  public wallets: AirGapWallet[]
  public symbolFilter: MainProtocolSymbols | undefined

  constructor(
    private readonly secretsService: SecretsService,
    private readonly translateService: TranslateService,
    private readonly navParams: NavParams,
    private readonly modalController: ModalController
  ) {}

  public async ngOnInit(): Promise<void> {
    const type = this.navParams.get('type')
    this.title = this.translateService.instant(`select-account.${type}.title`)
    this.heading = this.translateService.instant(`select-account.${type}.heading`)
    this.placeholder = this.translateService.instant(`select-account.${type}.placeholder`)

    this.secretsService.getSecretsObservable().subscribe(async (secrets: MnemonicSecret[]) => {
      const wallets: (AirGapWallet | undefined)[][] = await Promise.all(secrets.map((secret) => Promise.all(
        secret.wallets.map(async (wallet: AirGapWallet) => {
          return wallet.status === AirGapWalletStatus.ACTIVE && (!this.symbolFilter || (await wallet.protocol.getIdentifier() === this.symbolFilter))
            ? wallet
            : undefined
          })
      )))

      this.wallets = flattened(wallets).filter((wallet: AirGapWallet | undefined) => wallet !== undefined)
    })
  }

  public async setWallet(wallet: AirGapWallet) {
    this.modalController
      .dismiss(this.navParams.get('type') === 'message-signing' ? (await wallet.protocol.getIdentifier()) : wallet) // TODO: change to always return wallet, but it will require a change wherever the "message-signing" is used
      .catch((err) => console.error(err))
  }

  public async dismiss() {
    this.modalController.dismiss().catch((err) => console.error(err))
  }
}
