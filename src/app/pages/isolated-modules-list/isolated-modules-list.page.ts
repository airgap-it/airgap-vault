import { IsolatedModuleMetadata, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { IsolatedModulesOnboardingPage } from '../isolated-modules-onboarding/isolated-modules-onboarding.page'

// import * as actions from './isolated-modules-list.actions'
import * as fromIsolatedModulesList from './isolated-modules-list.reducer'

@Component({
  selector: 'airgap-isolated-modules-list-page',
  templateUrl: './isolated-modules-list.page.html',
  styleUrls: ['./isolated-modules-list.page.scss']
})
export class IsolatedModulesListPage {
  public readonly moduleName: string | undefined

  public readonly moduleMetadata$: Observable<UIResource<IsolatedModuleMetadata>>

  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  constructor(
    public readonly store: Store<fromIsolatedModulesList.State>,
    private readonly storageSerivce: VaultStorageService, 
    private readonly modalController: ModalController
  ) {
    this.storageSerivce.get(VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED).then((value) => {
      if (!value) this.goToOnboardingPage()
    })
  }

  public async goToOnboardingPage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: IsolatedModulesOnboardingPage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
