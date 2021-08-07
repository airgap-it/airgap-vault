import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { PinService, PinType } from 'src/app/services/pin/pin.service'

type PinRow = [number, number, number]

@Component({
  selector: 'airgap-pin',
  templateUrl: './pin.page.html',
  styleUrls: ['./pin.page.scss']
})
export class PinPage {
  public numberGroups: [PinRow, PinRow, PinRow, [number]] = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]]

  constructor(public readonly pinService: PinService, private readonly router: Router) {
    this.pinService.callback = (type: PinType) => {
      if (type === PinType.NORMAL) {
        this.router.navigateByUrl('/tabs/tab-accounts')
      } else if (type === PinType.DURESS) {
        this.router.navigateByUrl('/tabs/tab-accounts')
      } else if (type === PinType.BRICK) {
        this.router.navigateByUrl('/tabs/tab-accounts')
      }
    }
  }

  scramble() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort(() => {
      return 0.5 - Math.random()
    })
    this.numberGroups = [
      [numbers[0], numbers[1], numbers[2]],
      [numbers[3], numbers[4], numbers[5]],
      [numbers[6], numbers[7], numbers[8]],
      [numbers[9]]
    ]
  }
}
