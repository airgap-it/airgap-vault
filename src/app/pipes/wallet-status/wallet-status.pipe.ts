import { AirGapWallet } from '@airgap/coinlib-core'
import { AirGapWalletStatus } from '@airgap/coinlib-core/wallet/AirGapWallet'
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
