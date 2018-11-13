import { Component, Input } from '@angular/core'

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
