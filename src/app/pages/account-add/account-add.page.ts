import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { ICoinProtocol, supportedProtocols } from 'airgap-coin-lib'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { LocalAuthenticationOnboardingPage } from '../local-authentication-onboarding/local-authentication-onboarding.page'

@Component({
  selector: 'airgap-account-add',
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
    private readonly secretsService: SecretsService,
    private readonly storage: Storage,
    private readonly modalController: ModalController,
    private readonly navigationService: NavigationService
  ) {
    this.coinProtocols = supportedProtocols()
    this.onSelectedProtocolChange(this.navigationService.getState().protocol || this.coinProtocols[0])
  }

  public onSelectedProtocolChange(selectedProtocol: ICoinProtocol): void {
    this.selectedProtocol = selectedProtocol
    this.isHDWallet = this.selectedProtocol.supportsHD
    this.customDerivationPath = this.selectedProtocol.standardDerivationPath
  }

  public onIsHDWalletChange(isHDWallet: boolean): void {
    this.isHDWallet = isHDWallet

    this.customDerivationPath = isHDWallet
      ? this.selectedProtocol.standardDerivationPath
      : `${this.selectedProtocol.standardDerivationPath}/0/1`
  }

  public async addWallet(): Promise<void> {
    const value: boolean = await this.storage.get('DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING')
    if (!value) {
      const modal: HTMLIonModalElement = await this.modalController.create({
        component: LocalAuthenticationOnboardingPage
      })

      modal
        .onDidDismiss()
        .then(() => {
          this.addWalletAndReturnToAddressPage()
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    } else {
      this.addWalletAndReturnToAddressPage()
    }
  }

  private addWalletAndReturnToAddressPage(): void {
    this.secretsService
      .addWallet(this.selectedProtocol.identifier, this.isHDWallet, this.customDerivationPath)
      .then(() => {
        this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
  }
}
