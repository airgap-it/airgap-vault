import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'airgap-secret-option-item',
  templateUrl: './secret-option-item.component.html',
  styleUrls: ['./secret-option-item.component.scss']
})
export class SecretOptionItemComponent {
  @Input()
  public enabled: boolean = false

  @Input()
  public active?: boolean

  @Input()
  public icon?: string

  @Input()
  public checkboxValue?: boolean

  @Output()
  public action: EventEmitter<void> = new EventEmitter()

  constructor() {}

  doAction() {
    this.action.emit()
  }
}
