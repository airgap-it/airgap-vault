import { Component, Input } from '@angular/core'
@Component({
  selector: 'airgap-message-sign-request',
  templateUrl: './message-sign-request.component.html',
  styleUrls: ['./message-sign-request.component.scss']
})
export class MessageSignRequestComponent {
  @Input()
  public messages: {
    data: string
    blake2bHash?: string
  }[]

  constructor() {}
}
