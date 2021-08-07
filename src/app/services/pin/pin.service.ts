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
  public set pin(pin: string) {
    this._pin = pin
    this.scrambledPin = '*'.repeat(pin.length)
  }
  public get pin(): string {
    return this._pin
  }

  public callback: (type: PinType) => void = () => undefined

  public scrambledPin: string
  private _pin: string

  private normalPin: string = '1111' // TODO: REPLACE
  private duressPin: string = '2222' // TODO: REPLACE
  private brickPin: string = '3333' // TODO: REPLACE

  constructor() {}

  add(num: number) {
    this.pin += num
    this.check()
    // TODO: Scramble keyboard on keypress?
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
