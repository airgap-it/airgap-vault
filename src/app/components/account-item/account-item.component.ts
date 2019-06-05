import { Component, Input } from '@angular/core'
import { AirGapWallet } from 'airgap-coin-lib'

@Component({
  selector: 'account-item',
  templateUrl: './account-item.component.html',
  styleUrls: ['./account-item.component.scss']
})
export class AccountItemComponent {
  @Input()
  public wallet: AirGapWallet
}
