import { IsolatedModuleMetadata, ModulesService, UiEventService } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { IsolatedModulesDetailsMode } from './isolated-modules.details.types'
import { IsolatedModulesDetailsPopoverComponent } from './popover/isolated-modules-details-popover.component'

@Component({
  selector: 'airgap-isolated-modules-details-page',
  templateUrl: './isolated-modules-details.page.html',
  styleUrls: ['./isolated-modules-details.page.scss']
})
export class IsolatedModulesDetailsPage {
  public readonly IsolatedModulesDetailsMode: typeof IsolatedModulesDetailsMode = IsolatedModulesDetailsMode

  public readonly metadata: IsolatedModuleMetadata
  public readonly mode: IsolatedModulesDetailsMode
  
  constructor(
    private readonly navigationService: NavigationService,
    private readonly popoverController: PopoverController,
    private readonly uiEventService: UiEventService,
    private readonly modulesService: ModulesService
  ) {
    const state = this.navigationService.getState()
    this.metadata = state.metadata
    this.mode = state.mode
  }

  public async presentEditPopover(event: Event): Promise<void> {
    const popover: HTMLIonPopoverElement = await this.popoverController.create({
      component: IsolatedModulesDetailsPopoverComponent,
      componentProps: {
        onRemove: (): void => {
          this.removeModule()
        }
      },
      event,
      translucent: true
    })

    popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async installModule() {
    if (this.metadata) {
      await this.modulesService.installModule(this.metadata)
    }

    this.navigationService.back()
  }

  public async updateModule() {
    // TODO
  }

  public removeModule() {
    this.uiEventService.showTranslatedAlert({
      header: 'isolated-modules-details.alert.remove.header',
      message: 'isolated-modules-details.alert.remove.message',
      buttons: [
        {
          text: 'isolated-modules-details.alert.remove.cancel_label',
          role: 'cancel'
        },
        {
          text: 'isolated-modules-details.alert.remove.proceed_label',
          handler: async (): Promise<void> => {
            if (this.metadata) {
              await this.modulesService.removeInstalledModules([this.metadata.module.identifier])
            }
        
            this.navigationService.back()
          }
        }
      ]
    }).catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
