import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecretWalletInteractionPage } from './secret-wallet-interaction';
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    SecretWalletInteractionPage,
  ],
  imports: [IonicPageModule.forChild(SecretWalletInteractionPage), TranslateModule],
})
export class SecretWalletInteractionPageModule {}
