import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { LoadingController, ModalController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
// import { LocalAuthenticationOnboardingPage } from '../local-authentication-onboarding/local-authentication-onboarding'
import { ICoinProtocol, supportedProtocols } from 'airgap-coin-lib'

import { SecretsService } from '../../services/secrets/secrets.service'
import { LocalAuthenticationOnboardingPage } from '../local-authentication-onboarding/local-authentication-onboarding.page'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'

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
    private readonly storage: Storage,
    private readonly modalController: ModalController
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
    const value = await this.storage.get('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING')
    if (!value) {
      const modal = await this.modalController.create({
        component: LocalAuthenticationOnboardingPage
      })

      modal
        .onDidDismiss()
        .then(() => {
          this.addWalletAndReturnToAddressPage()
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      // this.router.navigateByUrl('/local-authentication-onboarding')
      // this.navCtrl
      //   .push(LocalAuthenticationOnboardingPage, {
      //     protocolIdentifier: this.selectedProtocol.identifier,
      //     isHDWallet: this.isHDWallet,
      //     customDerivationPath: this.customDerivationPath
      //   })
      //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      //   return
    } else {
      this.addWalletAndReturnToAddressPage()
    }
  }

  private async addWalletAndReturnToAddressPage() {
    console.log(this.selectedProtocol.identifier, this.isHDWallet, this.customDerivationPath)
    await this.secretsProvider.addWallet(this.selectedProtocol.identifier, this.isHDWallet, this.customDerivationPath)
    this.router.navigateByUrl('/tabs/tab-accounts')
  }
}
