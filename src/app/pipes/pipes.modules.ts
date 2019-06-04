import { NgModule } from '@angular/core'

import { AmountConverterPipe } from './amount-converter/amount-converter.pipe'
import { FeeConverterPipe } from './fee-converter/fee-converter.pipe'
import { WalletFilterPipe } from './wallet-filter/wallet-filter.pipe'

@NgModule({
  declarations: [AmountConverterPipe, FeeConverterPipe, WalletFilterPipe],
  imports: [],
  exports: [AmountConverterPipe, FeeConverterPipe, WalletFilterPipe]
})
export class PipesModule {}
