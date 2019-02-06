import { Component } from '@angular/core'
import { IonicPage } from 'ionic-angular'
import { TabScanPage } from '../tab-scan/tab-scan'
import { TabWalletsPage } from '../tab-wallets/tab-wallets'
import { TabSettingsPage } from '../tab-settings/tab-settings'

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tabWallets = TabWalletsPage
  tabScan = TabScanPage
  tabSettings = TabSettingsPage
}
