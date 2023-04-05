import { IsolatedModuleMetadata, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Observable } from 'rxjs'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { VaultModulesService } from 'src/app/services/modules/modules.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { IsolatedModulesDetailsMode } from '../isolated-modules-details/isolated-modules.details.types'
import { IsolatedModulesOnboardingPage } from '../isolated-modules-onboarding/isolated-modules-onboarding.page'

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
    private readonly storageSerivce: VaultStorageService, 
    private readonly modalController: ModalController,
    private readonly navigationService: NavigationService,
    private readonly modulesService: VaultModulesService
  ) {
    this.storageSerivce.get(VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED).then((value) => {
      if (!value) this.goToOnboardingPage()
    })
  }

  public ionViewWillLeave() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async addModule(): Promise<void> {
    try {
      const metadata: IsolatedModuleMetadata = await this.modulesService.loadModule()

      this.navigationService.routeWithState('/isolated-modules-details', { 
        metadata, 
        mode: IsolatedModulesDetailsMode.INSTALL 
      }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (e) {
      console.error('Loading protocol module data failed', e)
      // TODO: show alert
    }
  }

  public async onModuleSelected(metadata: IsolatedModuleMetadata): Promise<void> {
    this.navigationService.routeWithState('/isolated-modules-details', { metadata, mode: IsolatedModulesDetailsMode.VIEW_INSTALLED }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private async goToOnboardingPage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: IsolatedModulesOnboardingPage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
