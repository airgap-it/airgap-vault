import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AirGapWallet } from 'airgap-coin-lib'
import { BehaviorSubject } from 'rxjs'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-tab-accounts',
  templateUrl: './tab-accounts.page.html',
  styleUrls: ['./tab-accounts.page.scss']
})
export class TabAccountsPage implements OnInit {
  public symbolFilter: string | undefined
  public activeSecret: Secret

  public wallets = new BehaviorSubject<AirGapWallet[]>([])

  constructor(public router: Router, private readonly secretsProvider: SecretsService) {}

  public ngOnInit() {
    const secrets = this.secretsProvider.currentSecretsList.asObservable()
    secrets.subscribe(async (list: Secret[]) => {
      await this.secretsProvider.isReady()
      if (list.length === 0) {
        this.router.navigateByUrl('/secret-create/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    })

    if (this.secretsProvider.getActiveSecret()) {
      this.activeSecret = this.secretsProvider.getActiveSecret()
      this.wallets.next(this.activeSecret.wallets)
    }
  }

  public onSecretChanged(secret: Secret) {
    this.activeSecret = secret
    this.wallets.next(this.activeSecret.wallets)
  }

  public goToReceiveAddress(wallet: AirGapWallet) {
    this.router.navigate(['account-address'], { state: { wallet } }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public filterItems(ev: any) {
    let val = ev.target.value
    if (val && val !== '') {
      val = val.trim().toLowerCase()
      this.symbolFilter = val
    } else {
      this.symbolFilter = undefined
    }
  }

  public addWallet() {
    this.router.navigate(['account-add'])
  }
}
