import { Component } from '@angular/core'

@Component({
  selector: 'airgap-accounts-list-edit-popover',
  templateUrl: './accounts-list-edit-popover.component.html',
  styleUrls: ['./accounts-list-edit-popover.component.scss']
})
export class AccountsListEditPopoverComponent {
  private readonly onClickSyncWallets: Function
  private readonly onClickToggleDeleteView: Function
  private readonly onClickAddWallet: Function
  private readonly onClickEditSecret: Function

  constructor() {}

  public addWalletHandler(): void {
    if (this.onClickAddWallet) {
      this.onClickAddWallet()
    }
  }

  public syncWalletsHandler() {
    if (this.onClickSyncWallets) {
      this.onClickSyncWallets()
    }
  }
  public deleteViewHandler() {
    if (this.onClickToggleDeleteView) {
      this.onClickToggleDeleteView()
    }
  }
  public editSecretHandler() {
    if (this.onClickEditSecret) {
      this.onClickEditSecret()
    }
  }
}
