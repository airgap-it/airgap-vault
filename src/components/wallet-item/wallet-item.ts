import { Component, Input } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'

@Component({
  selector: 'wallet-item',
  templateUrl: 'wallet-item.html'
})
export class WalletItemComponent {

  @Input()
  wallet: AirGapWallet

}
