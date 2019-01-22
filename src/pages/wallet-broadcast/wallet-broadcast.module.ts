import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletBroadcastPage } from './wallet-broadcast';
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    WalletBroadcastPage,
  ],
  imports: [
    IonicPageModule.forChild(WalletBroadcastPage),TranslateModule
  ],
})
export class WalletBroadcastPageModule {}
