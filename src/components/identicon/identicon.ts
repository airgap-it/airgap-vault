import { Component, Input } from '@angular/core'
import { toDataUrl } from 'myetherwallet-blockies'
import { createIcon } from '@download/blockies'
import { BigNumber } from 'bignumber.js'

@Component({
  selector: 'identicon',
  templateUrl: 'identicon.html'
})
export class IdenticonComponent {
  // used in template
  identicon

  @Input()
  set address(value: string) {
    if (!value) {
      return
    }
    if (value.startsWith('ak_')) {
      this.identicon = createIcon({ seed: value }).toDataURL()
    } else if (value.startsWith('tz') || value.startsWith('kt')) {
      this.identicon = createIcon({ seed: `0${this.b582int(value)}`, spotcolor: '#000' }).toDataURL()
    } else {
      this.identicon = toDataUrl(value.toLowerCase())
    }
  }

  private b582int(v) {
    let rv = new BigNumber(0)
    let alpha = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    for (let i = 0; i < v.length; i++) {
      rv = rv.plus(new BigNumber(alpha.indexOf(v[v.length - 1 - i])).multipliedBy(new BigNumber(alpha.length).exponentiatedBy(i)))
    }
    return rv.toString(16)
  }
}
