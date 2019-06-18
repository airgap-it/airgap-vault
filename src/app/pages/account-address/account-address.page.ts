import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { AirGapWallet } from 'airgap-coin-lib'

import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ShareUrlService } from '../../services/share-url/share-url.service'

import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'

@Component({
  selector: 'airgap-account-address',
  templateUrl: './account-address.page.html',
  styleUrls: ['./account-address.page.scss']
})
export class AccountAddressPage implements OnInit {
  public wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService
  ) {
    this.wallet = this.navigationService.getState().wallet
  }

  public async ngOnInit(): Promise<void> {
    this.walletShareUrl = await this.shareUrlService.generateShareURL(this.wallet)
  }

  public done(): void {
    this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async share(): Promise<void> {
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: this.walletShareUrl
      },
      this.secretsService.getActiveSecret()
    )
  }

  public async presentEditPopover(event: Event): Promise<void> {
    const popover: HTMLIonPopoverElement = await this.popoverCtrl.create({
      component: AccountEditPopoverComponent,
      componentProps: {
        wallet: this.wallet,
        walletShareUrl: this.walletShareUrl,
        onDelete: (): void => {
          this.navigationService.back()
        }
      },
      event,
      translucent: true
    })

    return popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(this.wallet.receivingPublicAddress)
  }
}
