import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletSyncSelectionPage } from './wallet-sync-selection'
import { TranslateModule } from '@ngx-translate/core'
import { InteractionProvider } from '../../providers/interaction/interaction'

@NgModule({
  declarations: [WalletSyncSelectionPage],
  imports: [IonicPageModule.forChild(WalletSyncSelectionPage), TranslateModule],
  providers: [InteractionProvider]
})
export class WalletSyncSelectionPageModule {}
