import { Component } from '@angular/core'
import { NavParams } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secret-popover',
  templateUrl: './tab-secret-popover.component.html',
  styleUrls: ['./tab-secret-popover.component.scss']
})
export class TabSecretPopoverComponent {
  private readonly onClickSyncWallets: Function
  private readonly onClickNewSecret: Function

  constructor(public navigationService: NavigationService, protected navParams: NavParams) {}

  public syncWalletsHandler() {
    if (this.onClickSyncWallets) {
      this.onClickSyncWallets()
    }
  }

  public goToNewSecret(): void {
    if (this.onClickNewSecret) {
      this.onClickNewSecret()
    }
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
