import { AlertService } from './../../../services/alert/alert.service'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'

import { Secret } from '../../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../../services/error-handler/error-handler.service'
import { SecretsService } from '../../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-secret-edit-popover',
  templateUrl: './secret-edit-popover.component.html',
  styleUrls: ['./secret-edit-popover.component.scss']
})
export class SecretEditPopoverComponent {
  private readonly secret: Secret
  private readonly onDelete: Function

  constructor(
    private readonly alertService: AlertService,
    private readonly secretsService: SecretsService,
    private readonly popoverController: PopoverController
  ) {}

  public delete(): void {
    const resolve = () => {
      this.secretsService.remove(this.secret).catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
      this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      if (this.onDelete) {
        this.onDelete()
      }
    }
    const reject = () => this.popoverController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    this.alertService.deleteServiceAlert().then(resolve, reject)
  }
}
