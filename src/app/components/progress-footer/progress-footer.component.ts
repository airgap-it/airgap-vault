import { Component, Input, OnInit } from '@angular/core'

import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-progress-footer',
  templateUrl: './progress-footer.component.html',
  styleUrls: ['./progress-footer.component.scss']
})
export class ProgressFooterComponent implements OnInit {
  @Input()
  public progress: number = 0

  @Input()
  public maxProgress: number = 1

  // make sure to bind the context / method.bind(this)
  @Input()
  public rightAction: () => void

  @Input()
  public rightEnabled: boolean = true

  @Input()
  public rightLabel: string = 'Next'

  // make sure to bind the context / method.bind(this)
  @Input()
  public leftAction = (): void => {
    this.navigationSerivce.back()
  }

  @Input()
  public leftEnabled: boolean = true

  @Input()
  public leftLabel: string = 'Back'

  public progressArray: number[] = []

  constructor(private readonly navigationSerivce: NavigationService) {}

  public ngOnInit(): void {
    this.progressArray = new Array(this.maxProgress).fill(0).map((_value: number, index: number) => index)
    if (!this.rightAction) {
      throw new Error('ProgressFooterComponent: No "rightAction" method passed')
    }
  }
}
