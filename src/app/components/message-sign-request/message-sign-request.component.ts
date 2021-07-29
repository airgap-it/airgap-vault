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

  private hexToReadable(str: string): string {
    var result = ''
    const idx = str.startsWith('0x') ? 2 : 0
    for (var i = idx; i < str.length; i += 2) {
      result += String.fromCharCode(parseInt(str.substr(i, 2), 16))
    }

    const regex = /[^ A-Za-z0-9_@.,!?/#&+-\d\s:]/g
    const containsGibberish: boolean = result.match(regex)?.length > 0
    // if true then the message was most likely not a human readable message encoded in hex

    return containsGibberish ? str : result
  }

  constructor() {}
}
