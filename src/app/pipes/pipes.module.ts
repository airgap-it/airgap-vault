import { NgModule } from '@angular/core'

import { WalletFilterPipe } from './wallet-filter/wallet-filter.pipe'

@NgModule({
  declarations: [WalletFilterPipe],
  imports: [],
  exports: [WalletFilterPipe]
})
export class PipesModule {}
