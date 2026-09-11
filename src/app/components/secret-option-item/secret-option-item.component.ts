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

  @Input()
  public accessibleLabel?: string

  @Output()
  public action: EventEmitter<void> = new EventEmitter()

  constructor() {}

  public onItemClick(): void {
    if (this.checkboxValue === undefined) {
      this.doAction()
    }
  }

  public onCheckboxChange(): void {
    this.doAction()
  }

  private doAction(): void {
    this.action.emit()
  }
}
