import { IsolatedModuleMetadata, IsolatedModulesListPageFacade, ISOLATED_MODULES_LIST_PAGE_FACADE, UiEventService } from '@airgap/angular-core'
import { Component, Inject, OnInit } from '@angular/core'
import { ModalController, ViewWillEnter, ViewWillLeave } from '@ionic/angular'
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
export class IsolatedModulesListPage implements OnInit, ViewWillEnter, ViewWillLeave {
  constructor(
    @Inject(ISOLATED_MODULES_LIST_PAGE_FACADE) public readonly facade: IsolatedModulesListPageFacade,
    private readonly modalController: ModalController,
    private readonly uiEventService: UiEventService,
    private readonly storageService: VaultStorageService,
    private readonly navigationService: NavigationService,
    private readonly modulesService: VaultModulesService
  ) {
    this.storageService.get(VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED).then((value) => {
      if (!value) this.goToOnboardingPage()
    })
  }

  public ngOnInit(): void {
    this.facade.onViewInit()
  }

  public ionViewWillEnter(): void {
    this.facade.onViewWillEnter()
  }

  public ionViewWillLeave(): void {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async addModule(): Promise<void> {
    // TODO: move to common components
    try {
      const metadata: IsolatedModuleMetadata = await this.modulesService.loadModule()

      this.navigationService.routeWithState(`/isolated-modules-details/${IsolatedModulesDetailsMode.INSTALL}`, { 
        metadata, 
        mode: IsolatedModulesDetailsMode.INSTALL 
      }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (e) {
      this.uiEventService.showTranslatedAlert({
        header: `isolated-modules-list-page.alert.add.failed.header`,
        message: `isolated-modules-list-page.alert.add.failed.message`,
        buttons: [
          {
            text: `isolated-modules-list-page.alert.add.failed.ok_label`,
            role: 'cancel'
          }
        ]
      }).catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    }
  }
  
  public filterModules(event: any) {
    function isValidQuery(data: unknown): data is string {
      return data && typeof data === 'string' && data !== ''
    }

    const value: unknown = event.target.value
    this.facade.onFilterQueryChanged(isValidQuery(value) ? value.trim() : undefined)
  }

  public async onModuleSelected(metadata: IsolatedModuleMetadata): Promise<void> {
    const mode = metadata.type === 'asset' ? IsolatedModulesDetailsMode.VIEW_ASSET : IsolatedModulesDetailsMode.VIEW_INSTALLED
    this.navigationService.routeWithState(`/isolated-modules-details/${mode}`, { metadata, mode }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private async goToOnboardingPage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: IsolatedModulesOnboardingPage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
