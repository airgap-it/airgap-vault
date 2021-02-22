import { Component, Input } from '@angular/core'
import { AirGapWallet } from '@airgap/coinlib-core'

@Component({
  selector: 'airgap-account-item',
  templateUrl: './account-item.component.html',
  styleUrls: ['./account-item.component.scss']
})
export class AccountItemComponent {
  @Input()
  public wallet: AirGapWallet
}
