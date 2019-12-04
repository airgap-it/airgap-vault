import { Component, Input, OnChanges } from '@angular/core'

@Component({
  selector: 'airgap-entropy-progress',
  templateUrl: './entropy-progress.component.html',
  styleUrls: ['./entropy-progress.component.scss']
})
export class EntropyProgressComponent implements OnChanges {
  @Input()
  public maxValue: number = 1

  @Input()
  public value: number = 0

  public progressInPercent: number = 0

  public ngOnChanges(): void {
    this.progressInPercent = this.value > this.maxValue ? 100 : Math.floor((this.value / this.maxValue) * 100)
  }
}
