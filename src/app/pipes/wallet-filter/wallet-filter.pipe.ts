import { Pipe, PipeTransform } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'

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
        wallet =>
          wallet.coinProtocol.symbol.toLowerCase().includes(args.symbol) || wallet.coinProtocol.name.toLowerCase().includes(args.symbol)
      )
    }
  }
}
