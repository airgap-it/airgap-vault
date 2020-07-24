import { AlertService } from './../../../services/alert/alert.service'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet } from 'airgap-coin-lib'

import { ClipboardService } from '../../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../../services/error-handler/error-handler.service'
import { SecretsService } from '../../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-account-edit-popover',
  templateUrl: 'account-edit-popover.component.html',
  styleUrls: ['./account-edit-popover.component.scss']
})
export class AccountEditPopoverComponent {
  private readonly wallet: AirGapWallet
  private readonly onDelete: Function
  private readonly walletShareUrl: string

  constructor(
    private readonly alertService: AlertService,
    private readonly clipboardService: ClipboardService,
    private readonly secretsService: SecretsService,
    private readonly popoverController: PopoverController,
    private readonly translateService: TranslateService
  ) {}

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(
      this.wallet.receivingPublicAddress,
      this.translateService.instant('wallet-edit-delete-popover.confirm_address_copy')
    )

    await this.popoverController.dismiss()
  }

  public async copyShareUrlToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(
      this.walletShareUrl,
      this.translateService.instant('wallet-edit-delete-popover.confirm_sync_code_copy')
    )

    await this.popoverController.dismiss()
  }

  public delete(): void {
    const buttons = [
      {
        text: 'wallet-edit-delete-popover.account-removal_alert.cancel_label',
        role: 'cancel',
        handler: (): void => {
          reject()
        }
      },
      {
        text: 'wallet-edit-delete-popover.account-removal_alert.delete_label',
        handler: (): void => {
          resolve()
        }
      }
    ]
    const resolve = () => {
      this.secretsService
        .removeWallet(this.wallet)
        .then(() => {
          this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
          if (this.onDelete) {
            this.onDelete()
          }
        })
        .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
    }
    const reject = () => this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))

    this.alertService
      .showTranslatedAlert(
        'wallet-edit-delete-popover.account-removal_alert.title',
        'wallet-edit-delete-popover.account-removal_alert.text',
        true,
        buttons
      )
      .then(resolve, reject)
  }
}
