import { Component, Input } from '@angular/core'

/**
 * Generated class for the AddressRowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
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
