import { Component, Input } from '@angular/core'

@Component({
  selector: 'address-row',
  templateUrl: './address-row.component.html',
  styleUrls: ['./address-row.component.scss']
})
export class AddressRowComponent {
  @Input()
  label: string

  @Input()
  address: string
}
