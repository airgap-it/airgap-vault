import { Component } from '@angular/core'
import { IonicPage } from 'ionic-angular'
import { TabSecretsPage } from '../tab-secrets/tab-secrets'
import { TabScanPage } from '../tab-scan/tab-scan'
import { TabWalletsPage } from '../tab-wallets/tab-wallets'

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tabSecrets = TabSecretsPage
  tabWallets = TabWalletsPage
  tabScan = TabScanPage

}
