import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'airgap-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss']
})
export class ProgressIndicatorComponent implements OnInit {
  @Input()
  public currentShare: number = 0

  @Input()
  public totalShares: number = 0
  constructor() {}

  ngOnInit() {}
}
