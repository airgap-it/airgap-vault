import { IsolatedModuleMetadata, UiEventService } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { VaultModulesService } from 'src/app/services/modules/modules.service'
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
  private readonly oldMetadata: IsolatedModuleMetadata

  public isVerified: boolean = false

  public readonly mode: IsolatedModulesDetailsMode
  
  constructor(
    private readonly navigationService: NavigationService,
    private readonly popoverController: PopoverController,
    private readonly uiEventService: UiEventService,
    private readonly modulesService: VaultModulesService
  ) {
    const state = this.navigationService.getState()
    this.metadata = state.metadata
    this.oldMetadata = state.oldMetadata
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
    if (this.mode === IsolatedModulesDetailsMode.UPDATE && this.oldMetadata && this.oldMetadata.type === 'installed') {
      await this.modulesService.removeInstalledModule(this.oldMetadata, true)
    }

    if (this.metadata && this.metadata.type === 'preview') {
      await this.modulesService.installModule(this.metadata)
    }

    this.navigationService.route('/isolated-modules-list', true).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async updateModule() {
    if (!this.metadata) {
      return
    }

    try {
      const updatedMetadata: IsolatedModuleMetadata = await this.loadUpdate()
      this.checkUpdatePublicKey(updatedMetadata)

      this.navigationService.routeWithState(`/isolated-modules-details/${IsolatedModulesDetailsMode.UPDATE}`, {
        metadata: updatedMetadata,
        oldMetadata: this.metadata,
        mode: IsolatedModulesDetailsMode.UPDATE 
      }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (e) {
      const alertType = typeof e === 'object' && 'type' in e
        ? e.type
        : 'generic'

      this.uiEventService.showTranslatedAlert({
        header: `isolated-modules-details-page.alert.update.${alertType}.header`,
        message: `isolated-modules-details-page.alert.update.${alertType}.message`,
        buttons: [
          {
            text: `isolated-modules-details-page.alert.update.${alertType}.ok_label`,
            role: 'cancel'
          }
        ]
      }).catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    }
  }

  public removeModule() {
    this.uiEventService.showTranslatedAlert({
      header: 'isolated-modules-details-page.alert.remove.header',
      message: 'isolated-modules-details-page.alert.remove.message',
      buttons: [
        {
          text: 'isolated-modules-details-page.alert.remove.cancel_label',
          role: 'cancel'
        },
        {
          text: 'isolated-modules-details-page.alert.remove.proceed_label',
          handler: async (): Promise<void> => {
            if (this.metadata && this.metadata.type === 'installed') {
              await this.modulesService.removeInstalledModule(this.metadata)
            }
        
            this.navigationService.route('/isolated-modules-list', true).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
          }
        }
      ]
    }).catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public onIsVerified(isVerified) {
    this.isVerified = isVerified
  }

  private async loadUpdate(): Promise<IsolatedModuleMetadata> {
    try {
      return await this.modulesService.loadModule()
    } catch (e) {
      console.error(e)
      throw { type: 'load-failed' }
    }
  }

  private checkUpdatePublicKey(updatedMetadata: IsolatedModuleMetadata) {
    if (this.getNormalizedPublicKey(this.metadata) !== this.getNormalizedPublicKey(updatedMetadata)) {
     throw { type: 'different-public-key' }
    }
  }

  private getNormalizedPublicKey(metadata: IsolatedModuleMetadata): string {
    return metadata.manifest.publicKey.toLowerCase().replace(/^0x/, '')
  }
}
