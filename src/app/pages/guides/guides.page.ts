import { Component } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-guides',
  templateUrl: './guides.page.html',
  styleUrls: ['./guides.page.scss']
})
export class GuidesPage {
  constructor(private readonly navigationService: NavigationService) {}

  public bip85(): void {
    this.openLinkPage(
      'BIP85',
      'https://support.airgap.it/features/bip85',
      `BIP-85 allows you to derive "entropy" from your mnemonics. The entropy that is derived can be used in other wallets or applications.`
    )
  }

  public socialRecovery(): void {
    this.openLinkPage(
      'Social Recovery',
      'https://support.airgap.it/features/social-recovery',
      `Social recovery works by relying on a group of trusted people to assist you in recovering a lost secret. It solves the problem of having a single point of failure when you back up your seed words.`
    )
  }

  public updateAirGap(): void {
    this.openLinkPage(
      'How to update AirGap Vault on an offline device',
      'https://support.airgap.it/guides/airgap-vault-offline-update-android',
      `For maximum security, we recommend that our users do not connect the device to the internet with which the vault is installed, therefore making it impossible to keep the app updated directly from the google play store.`
    )
  }

  private openLinkPage(title: string, link: string, description?: string) {
    this.navigationService
      .routeWithState('/link-page', {
        title,
        link,
        description
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
