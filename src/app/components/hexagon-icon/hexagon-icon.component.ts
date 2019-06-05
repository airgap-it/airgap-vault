import { Component, Input } from '@angular/core'

@Component({
  selector: 'hexagon-icon',
  templateUrl: './hexagon-icon.component.html',
  styleUrls: ['./hexagon-icon.component.scss']
})
export class HexagonIconComponent {
  @Input()
  public backgroundColor: string

  @Input()
  public textColor = 'white'

  @Input()
  public letter: string

  @Input()
  public icon = 'add'

  @Input()
  public opacity = 1
}
