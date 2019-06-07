import { Component, Input } from '@angular/core'

@Component({
  selector: 'airgap-address-row',
  templateUrl: './address-row.component.html',
  styleUrls: ['./address-row.component.scss']
})
export class AddressRowComponent {
  @Input()
  public label: string

  @Input()
  public address: string
}
