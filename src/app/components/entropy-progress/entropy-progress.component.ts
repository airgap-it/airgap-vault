import { Component, Input, OnChanges } from '@angular/core'

@Component({
  selector: 'entropy-progress',
  templateUrl: './entropy-progress.component.html',
  styleUrls: ['./entropy-progress.component.scss']
})
export class EntropyProgressComponent implements OnChanges {
  @Input()
  public maxValue: number = 1

  @Input()
  public value: number = 0

  public progressInPercent = 0

  public ngOnChanges() {
    if (this.value > this.maxValue) {
      this.progressInPercent = 100
    } else {
      this.progressInPercent = Math.floor((this.value / this.maxValue) * 100)
    }
  }
}
