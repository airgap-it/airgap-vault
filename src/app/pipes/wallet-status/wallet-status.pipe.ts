import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'walletStatus'
})
export class WalletStatusPipe implements PipeTransform {
  public transform(items: AirGapWallet[], args: { status: AirGapWalletStatus }): any {
    if (!items) {
      return []
    }

    return items.filter((wallet: AirGapWallet) => wallet.status === args.status)
  }
}
