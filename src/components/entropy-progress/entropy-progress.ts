import { Component, Input, OnChanges } from '@angular/core'

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

  ngOnChanges() {
    if (this.value > this.maxValue) {
      this.progressInPercent = 100
    } else {
      this.progressInPercent = Math.floor((this.value / this.maxValue) * 100)
    }
  }
}
