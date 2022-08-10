import { NgModule } from '@angular/core'
import { SecretFilterPipe } from './secret-filter/secret-filter.pipe'

import { WalletStatusPipe } from './wallet-status/wallet-status.pipe'

@NgModule({
  declarations: [WalletStatusPipe, SecretFilterPipe],
  imports: [],
  exports: [WalletStatusPipe, SecretFilterPipe]
})
export class PipesModule {}
