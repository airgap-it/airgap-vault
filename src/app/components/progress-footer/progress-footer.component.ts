import { Component, Input } from '@angular/core'
import { NavController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'progress-footer',
  templateUrl: './progress-footer.component.html',
  styleUrls: ['./progress-footer.component.scss']
})
export class ProgressFooterComponent {
  @Input()
  public progress = 0

  @Input()
  public maxProgress = 1

  // make sure to bind the context / method.bind(this)
  @Input()
  public rightAction: () => void

  @Input()
  public rightEnabled = true

  @Input()
  public rightLabel = 'Next'

  // make sure to bind the context / method.bind(this)
  @Input()
  public leftAction = () => {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  @Input()
  public leftEnabled = true

  @Input()
  public leftLabel = 'Back'

  public progressArray: number[] = []

  constructor(private readonly navController: NavController) {}

  public ngOnInit() {
    this.progressArray = new Array(this.maxProgress).fill(0).map((_x, i) => i)
    if (!this.rightAction) {
      throw new Error('ProgressFooterComponent: No "rightAction" method passed')
    }
  }
}
