import { Location } from '@angular/common'
import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'
import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'
import { InteractionService } from './../../services/interaction/interaction.service'
import { InteractionOperationType } from './../../services/interaction/interaction.service'
import { ClipboardService } from './../../services/clipboard/clipboard.service'
import { ShareUrlService } from './../../services/share-url/share-url.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { Component } from '@angular/core'
import { NavController, PopoverController } from '@ionic/angular'
import { AirGapWallet } from 'airgap-coin-lib'

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

    private popoverCtrl: PopoverController,
    private clipboardProvider: ClipboardService,
    private navController: NavController,
    private secretsProvider: SecretsService,
    private shareUrlProvider: ShareUrlService,
    private interactionProvider: InteractionService
  ) {
    // this.wallet = this.navParams.get('wallet')
  }

  async ionViewDidEnter() {
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
  }

  done() {
    // this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async share() {
    this.interactionProvider.startInteraction(
      this.navController,
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: this.walletShareUrl
      },
      this.secretsProvider.getActiveSecret()
    )
  }

  async presentEditPopover(event) {
    const popover = await this.popoverCtrl.create({
      component: AccountEditPopoverComponent,
      componentProps: {
        wallet: this.wallet,
        onDelete: () => {
          this.location.back()
        }
      },
      event: event,
      translucent: true
    })
    return popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  async copyAddressToClipboard() {
    await this.clipboardProvider.copyAndShowToast(this.wallet.receivingPublicAddress)
  }
}
