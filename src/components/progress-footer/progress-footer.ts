import { Component, Input } from '@angular/core'
import { NavController } from 'ionic-angular'

@Component({
  selector: 'progress-footer',
  templateUrl: 'progress-footer.html'
})
export class ProgressFooterComponent {
  @Input()
  progress = 0

  @Input()
  maxProgress = 1

  // make sure to bind the context / method.bind(this)
  @Input()
  rightAction: () => void

  @Input()
  rightEnabled = true

  @Input()
  rightLabel = 'Next'

  // make sure to bind the context / method.bind(this)
  @Input()
  leftAction = () => {
    this.navController.pop()
  }

  @Input()
  leftEnabled = true

  @Input()
  leftLabel = 'Back'

  private progressArray: number[] = []

  constructor(private navController: NavController) {}

  ngOnInit() {
    this.progressArray = new Array(this.maxProgress).fill(0).map((x, i) => i)
    if (!this.rightAction) {
      throw new Error('ProgressFooterComponent: No "rightAction" method passed')
    }
  }
}
