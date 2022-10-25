import { Component } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secret-popover',
  templateUrl: './tab-secret-popover.component.html',
  styleUrls: ['./tab-secret-popover.component.scss']
})
export class TabSecretPopoverComponent {
  private readonly onClick: Function

  constructor(public navigationService: NavigationService) {}

  public goToNewSecret(): void {
    if (this.onClick) {
      this.onClick()
    }
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
