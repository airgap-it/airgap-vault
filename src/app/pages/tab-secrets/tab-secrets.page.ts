import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { MnemonicSecret } from '../../models/secret'
import { Observable } from 'rxjs'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secrets',
  templateUrl: './tab-secrets.page.html',
  styleUrls: ['./tab-secrets.page.scss']
})
export class TabSecretsPage {
  public secrets: Observable<MnemonicSecret[]>

  constructor(
    public modalController: ModalController,
    public navigationService: NavigationService,
    // private popoverCtrl: PopoverController,
    private secretsService: SecretsService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  // TODO JGD NEXT
  //
  // - add settings icon to top right
  // - add settings page
  // - when adding new account it should not jump back to TabSecretsPage view
  // - check multi-secret view (scrolling)
  // - check very long secret name
  // - investigate active secret? CurrentSecretComponent

  public goToNewSecret(): void {
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  presentAboutPopover(_event) {
    //   let popover = this.popoverCtrl.create(AboutPopoverComponent)
    //   popover.present({
    //     ev: event
    //   })
  }
}
