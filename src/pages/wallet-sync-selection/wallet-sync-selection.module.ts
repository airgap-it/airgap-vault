import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletSyncSelectionPage } from './wallet-sync-selection'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [WalletSyncSelectionPage],
  imports: [IonicPageModule.forChild(WalletSyncSelectionPage), TranslateModule]
})
export class WalletSyncSelectionPageModule {}
