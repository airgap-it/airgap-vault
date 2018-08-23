import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'

/**
 * Generated class for the EntropyProgressComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'entropy-progress',
  templateUrl: 'entropy-progress.html'
})
export class EntropyProgressComponent implements OnChanges {

  @Input()
  maxValue: number = 1

  @Input()
  value: number = 0

  progressInPercent = 0

  ngOnChanges(changes: SimpleChanges) {
    if (this.value > this.maxValue) {
      this.progressInPercent = 100
    } else {
      this.progressInPercent = Math.floor(this.value / this.maxValue * 100)
    }
  }
}
