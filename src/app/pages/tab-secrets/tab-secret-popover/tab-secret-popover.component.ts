import { Component } from '@angular/core'
import { NavParams } from '@ionic/angular'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secret-popover',
  templateUrl: './tab-secret-popover.component.html',
  styleUrls: ['./tab-secret-popover.component.scss']
})
export class TabSecretPopoverComponent {
  private readonly onClickSyncWallets: Function

  constructor(public navigationService: NavigationService, protected navParams: NavParams) {}

  public syncWalletsHandler() {
    if (this.onClickSyncWallets) {
      this.onClickSyncWallets()
    }
  }
}
