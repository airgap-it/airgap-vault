import { Component, Input } from '@angular/core'

/**
 * Generated class for the HexagonIconComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'hexagon-icon',
  templateUrl: 'hexagon-icon.html'
})
export class HexagonIconComponent {

  @Input()
  backgroundColor: string

  @Input()
  textColor = 'white'

  @Input()
  letter: string

  @Input()
  icon = 'add'

  @Input()
  opacity = 1

}
