import { Component, Input } from '@angular/core'
@Component({
  selector: 'airgap-message-sign-request',
  templateUrl: './message-sign-request.component.html',
  styleUrls: ['./message-sign-request.component.scss']
})
export class MessageSignRequestComponent {
  public _messages: {
    data: string
    blake2bHash?: string
  }[]

  @Input()
  set messages(messages: { data: string; blake2bHash?: string }[]) {
    this._messages = messages.map((message) => {
      const data = this.hexToReadable(message.data)
      return { ...message, data }
    })
  }

  private hexToReadable(hex: string): string {
    var str = ''
    const idx = hex.startsWith('0x') ? 2 : 0
    for (var i = idx; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }
    return str
  }

  constructor() {}
}
