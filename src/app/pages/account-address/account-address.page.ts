import { Location } from '@angular/common'
import { Component } from '@angular/core'
import { NavController, PopoverController } from '@ionic/angular'
import { AirGapWallet } from 'airgap-coin-lib'

import { SecretsService } from '../../services/secrets/secrets.service'

import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionService } from '../../services/interaction/interaction.service'
import { InteractionOperationType } from '../../services/interaction/interaction.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'
import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'
import { Router } from '@angular/router'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss']
})
export class AccountAddressPage {
  public wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    private readonly location: Location,

    private readonly popoverCtrl: PopoverController,
    private readonly clipboardProvider: ClipboardService,
    private readonly router: Router,
    private readonly secretsProvider: SecretsService,
    private readonly shareUrlProvider: ShareUrlService,
    private readonly interactionProvider: InteractionService,
    private readonly navigationService: NavigationService
  ) {
    this.wallet = this.navigationService.getState().wallet
  }

  public async ionViewDidEnter() {
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
  }

  public done() {
    this.router.navigateByUrl('/tabs/tab-accounts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async share() {
    this.interactionProvider.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: this.walletShareUrl
      },
      this.secretsProvider.getActiveSecret()
    )
  }

  public async presentEditPopover(event) {
    const popover = await this.popoverCtrl.create({
      component: AccountEditPopoverComponent,
      componentProps: {
        wallet: this.wallet,
        onDelete: () => {
          this.location.back()
        }
      },
      event,
      translucent: true
    })

    return popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public async copyAddressToClipboard() {
    await this.clipboardProvider.copyAndShowToast(this.wallet.receivingPublicAddress)
  }
}
