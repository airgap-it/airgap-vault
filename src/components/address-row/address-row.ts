import { Component, Input } from '@angular/core'

@Component({
  selector: 'address-row',
  templateUrl: 'address-row.html'
})
export class AddressRowComponent {
  @Input()
  label: string

  @Input()
  address: string
}
