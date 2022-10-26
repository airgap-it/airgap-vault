import { MessageSignResponse } from '@airgap/serializer'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'airgap-message-sign-response',
  templateUrl: './message-sign-response.component.html',
  styleUrls: ['./message-sign-response.component.scss']
})
export class MessageSignResponseComponent {
  @Input()
  public messageSignResponse: MessageSignResponse

  public displayRawData: boolean = false

  constructor() {}

  public toggleDisplayRawData(): void {
    this.displayRawData = !this.displayRawData
  }
}
