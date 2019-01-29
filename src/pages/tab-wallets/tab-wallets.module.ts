import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TabWalletsPage } from './tab-wallets'
import { ComponentsModule } from '../../components/components.module'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { FilterWalletsPipe } from './fillter-wallets.filter'
import { TranslateModule } from '@ngx-translate/core'
import { SecretWalletInteractionPage } from '../secret-wallet-interaction/secret-wallet-interaction'


@NgModule({
  declarations: [TabWalletsPage, FilterWalletsPipe, SecretWalletInteractionPage],
  imports: [ComponentsModule, MaterialIconsModule, IonicPageModule.forChild(TabWalletsPage), TranslateModule],
  entryComponents: [TabWalletsPage, SecretWalletInteractionPage]
})
export class TabWalletsPageModule {}
