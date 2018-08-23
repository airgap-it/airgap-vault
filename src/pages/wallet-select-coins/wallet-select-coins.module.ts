import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletSelectCoinsPage } from './wallet-select-coins'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  declarations: [
    WalletSelectCoinsPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(WalletSelectCoinsPage)
  ]
})
export class WalletSelectCoinsPageModule {}
