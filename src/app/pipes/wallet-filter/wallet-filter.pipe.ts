import { Pipe, PipeTransform } from '@angular/core'
import { AirGapWallet } from '@airgap/coinlib-core'

@Pipe({
  name: 'walletFilter'
})
export class WalletFilterPipe implements PipeTransform {
  public transform(items: AirGapWallet[], args: { symbol: string }): any {
    if (!items) {
      return []
    }

    if (!args.symbol) {
      return items
    } else {
      return items.filter(
        (wallet) => wallet.protocol.symbol.toLowerCase().includes(args.symbol) || wallet.protocol.name.toLowerCase().includes(args.symbol)
      )
    }
  }
}
