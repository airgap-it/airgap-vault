import { Component, Input } from '@angular/core'

const fromHex = (str: string) => {
  var result = ''

  const idx = str.startsWith('0x') ? 2 : 0

  for (var i = idx; i < str.length; i += 2) {
    result += String.fromCharCode(parseInt(str.substr(i, 2), 16))
  }

  const regex = /[^ A-Za-z0-9_@.,!?/#&+-\d\s:]/g
  // Check if at least 9 out of 10 characters are human readable
  const containsGibberish: boolean = result.match(regex)?.length > str.length / 2 / 10
  // If true then the message was most likely not a human readable message encoded in hex

  if (containsGibberish) {
    throw new Error('Probably not a human readable text encoded as hex.')
  }

  return result
}

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
    // Parse JSON objects
    try {
      return JSON.parse(str)
    } catch {}

    // Check if hex can be converted to UTF-8
    try {
      return fromHex(str)
    } catch {}

    return str
  }

  constructor() {}
}
