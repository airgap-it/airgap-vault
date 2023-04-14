import { Component } from '@angular/core'
import { NavParams } from '@ionic/angular'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secret-popover',
  templateUrl: './tab-secret-popover.component.html',
  styleUrls: ['./tab-secret-popover.component.scss']
})
export class TabSecretPopoverComponent {
  private readonly onClickNewSecret: Function
  private readonly onClickSyncWallets: Function

  constructor(public navigationService: NavigationService, protected navParams: NavParams) {}

  public goToNewSecret(): void {
    if (this.onClickNewSecret) {
      this.onClickNewSecret()
    }
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public syncWalletsHandler() {
    if (this.onClickSyncWallets) {
      this.onClickSyncWallets()
    }
  }
}
