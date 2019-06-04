import { Component, OnInit } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'
import { Secret } from 'src/app/models/secret'
import { BehaviorSubject } from 'rxjs'
import { NavController } from '@ionic/angular'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

@Component({
  selector: 'app-tab-accounts',
  templateUrl: './tab-accounts.page.html',
  styleUrls: ['./tab-accounts.page.scss']
})
export class TabAccountsPage implements OnInit {
  symbolFilter: string | undefined
  activeSecret: Secret

  public wallets = new BehaviorSubject<AirGapWallet[]>([])

  constructor(public navController: NavController, private secretsProvider: SecretsService) {}

  ngOnInit() {
    let secrets = this.secretsProvider.currentSecretsList.asObservable()
    secrets.subscribe(async list => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        // TODO
        // this.navController.push(SecretCreatePage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })

    if (this.secretsProvider.getActiveSecret()) {
      this.activeSecret = this.secretsProvider.getActiveSecret()
      this.wallets.next(this.activeSecret.wallets)
    }
  }

  onSecretChanged(secret: Secret) {
    this.activeSecret = secret
    this.wallets.next(this.activeSecret.wallets)
  }

  goToReceiveAddress(wallet: AirGapWallet) {
    // TODO
    // this.navController.push(WalletAddressPage, { wallet: wallet }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  filterItems(ev: any) {
    let val = ev.target.value
    if (val && val !== '') {
      val = val.trim().toLowerCase()
      this.symbolFilter = val
    } else {
      this.symbolFilter = undefined
    }
  }

  addWallet() {
    // TODO
    // this.navController.push(WalletSelectCoinsPage).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
