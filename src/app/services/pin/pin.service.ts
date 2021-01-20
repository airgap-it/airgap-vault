import { Injectable } from '@angular/core'

export enum PinType {
  NORMAL = 'normal',
  DURESS = 'duress',
  BRICK = 'brick'
}

@Injectable({
  providedIn: 'root'
})
export class PinService {
  public pin: string = ''
  public callback: (type: PinType) => void = () => undefined
  private normalPin: string = '1111'
  private duressPin: string = '2222'
  private brickPin: string = '3333'

  constructor() {}

  add(num: number) {
    this.pin += num
    this.check()
  }

  removeLast() {
    this.pin = this.pin.slice(0, this.pin.length - 1)
    this.check()
  }

  check() {
    if (this.pin === this.normalPin) {
      this.callback(PinType.NORMAL)
    } else if (this.pin === this.duressPin) {
      this.callback(PinType.DURESS)
    } else if (this.pin === this.brickPin) {
      this.callback(PinType.BRICK)
    }
  }
}
