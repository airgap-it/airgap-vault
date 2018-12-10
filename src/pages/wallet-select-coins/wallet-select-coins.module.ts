import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletSelectCoinsPage } from './wallet-select-coins'
import { ComponentsModule } from '../../components/components.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [WalletSelectCoinsPage],
  imports: [ComponentsModule, IonicPageModule.forChild(WalletSelectCoinsPage), TranslateModule]
})
export class WalletSelectCoinsPageModule {}
