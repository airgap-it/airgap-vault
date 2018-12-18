import { Component, Input } from '@angular/core'
import { toDataUrl } from 'myetherwallet-blockies'
import { createIcon } from '@download/blockies'

@Component({
  selector: 'identicon',
  templateUrl: 'identicon.html'
})
export class IdenticonComponent {
  private identicon

  @Input()
  set address(value: string) {
    if (value.startsWith('ak_')) {
      this.identicon = createIcon({ seed: value }).toDataURL()
    } else {
      this.identicon = toDataUrl(value.toLowerCase())
    }
  }
}
