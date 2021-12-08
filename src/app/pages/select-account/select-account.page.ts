import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Component } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'

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
  public symbolFilter: string | undefined

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

    this.secretsService.getSecretsObservable().subscribe((secrets: MnemonicSecret[]) => {
      this.wallets = [].concat.apply(
        [],
        secrets.map((secret) => secret.wallets.filter((wallet: AirGapWallet) => wallet.status === AirGapWalletStatus.ACTIVE)) as any
      )
    })
  }

  public async setWallet(wallet: AirGapWallet) {
    this.modalController.dismiss(wallet).catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async dismiss() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
