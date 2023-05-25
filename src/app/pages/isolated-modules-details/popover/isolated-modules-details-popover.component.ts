import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../../services/error-handler/error-handler.service'

@Component({
  selector: 'isolated-modules-details-popover',
  templateUrl: './isolated-modules-details-popover.component.html',
  styleUrls: ['./isolated-modules-details-popover.component.scss']
})
export class IsolatedModulesDetailsPopoverComponent {
  private readonly onRemove: Function

  constructor(private readonly popoverController: PopoverController) {}

  public removeModule(): void {
    if (this.onRemove) {
      this.onRemove()
      this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    }
  }
}
