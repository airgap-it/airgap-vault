import { NgModule } from '@angular/core'

import { WalletStatusPipe } from './wallet-status/wallet-status.pipe'

@NgModule({
  declarations: [WalletStatusPipe],
  imports: [],
  exports: [WalletStatusPipe]
})
export class PipesModule {}
