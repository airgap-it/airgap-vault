import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { LoadingController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
// import { LocalAuthenticationOnboardingPage } from '../local-authentication-onboarding/local-authentication-onboarding'
import { ICoinProtocol, supportedProtocols } from 'airgap-coin-lib'

import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'app-account-add',
  templateUrl: './account-add.page.html',
  styleUrls: ['./account-add.page.scss']
})
export class AccountAddPage {
  public selectedProtocol: ICoinProtocol
  public customDerivationPath: string
  public coinProtocols: ICoinProtocol[]
  public isHDWallet: boolean = false
  public isAdvancedMode: boolean = false

  constructor(
    public loadingCtrl: LoadingController,
    public router: Router,
    private readonly secretsProvider: SecretsService,
    private readonly storage: Storage
  ) {
    this.coinProtocols = supportedProtocols()
    try {
      // TODO
      // this.selectedProtocol = getProtocolByIdentifier(this.navParams.get('protocol'))
    } catch (error) {}
  }

  public ionViewDidLoad() {
    console.log('ionViewDidLoad WalletSelectCoinsPage')
  }

  public onSelectedProtocolChange(selectedProtocol) {
    console.log(selectedProtocol)
    this.selectedProtocol = selectedProtocol
    this.isHDWallet = this.selectedProtocol.supportsHD
    this.customDerivationPath = this.selectedProtocol.standardDerivationPath
  }

  public onIsHDWalletChange(isHDWallet) {
    this.isHDWallet = isHDWallet
    if (isHDWallet) {
      this.customDerivationPath = this.selectedProtocol.standardDerivationPath
    } else {
      this.customDerivationPath = `${this.selectedProtocol.standardDerivationPath}/0/1`
    }
  }

  public async addWallet() {
    // TODO
    // const value = await this.storage.get('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING')
    // if (!value) {
    // this.navCtrl
    //   .push(LocalAuthenticationOnboardingPage, {
    //     protocolIdentifier: this.selectedProtocol.identifier,
    //     isHDWallet: this.isHDWallet,
    //     customDerivationPath: this.customDerivationPath
    //   })
    //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    //   return
    // }
    console.log(this.selectedProtocol.identifier, this.isHDWallet, this.customDerivationPath)
    await this.secretsProvider.addWallet(this.selectedProtocol.identifier, this.isHDWallet, this.customDerivationPath)
    // this.router.navigateByUrl('/tabs/tab-accounts')
    // TODO
    // await this.navCtrl.popToRoot()

    // navigate to wallets tab after initial derivation
    // TODO
    // if (this.app.getActiveNavs().length > 0) {
    //   ;(this.app.getActiveNavs()[0] as any).parent.select(0)
    // }
  }
}
