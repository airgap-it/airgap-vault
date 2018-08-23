import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TabWalletsPage } from './tab-wallets'
import { ComponentsModule } from '../../components/components.module'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { FilterWalletsPipe } from './fillter-wallets.filter'

@NgModule({
  declarations: [
    TabWalletsPage,
    FilterWalletsPipe
  ],
  imports: [
    ComponentsModule,
    MaterialIconsModule,
    IonicPageModule.forChild(TabWalletsPage)
  ],
  entryComponents: [
    TabWalletsPage
  ]
})
export class TabWalletsPageModule {}
