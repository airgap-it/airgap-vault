import { IsolatedModuleMetadata, ModulesService, UiEventService, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { Component, Inject } from '@angular/core'
import { FilePickerPlugin, PickFilesResult } from '@capawesome/capacitor-file-picker'
import { ModalController } from '@ionic/angular'
import { Observable } from 'rxjs'
import { FILE_PICKER_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { IsolatedModulesOnboardingPage } from '../isolated-modules-onboarding/isolated-modules-onboarding.page'

// import * as actions from './isolated-modules-list.actions'

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
    private readonly moduleService: ModulesService,
    private readonly uiEventService: UiEventService,
    @Inject(FILE_PICKER_PLUGIN) private readonly filePicker: FilePickerPlugin
  ) {
    this.storageSerivce.get(VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED).then((value) => {
      if (!value) this.goToOnboardingPage()
    })
  }

  public ionViewWillLeave() {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async addModule(): Promise<void> {
    let loader: HTMLIonLoadingElement | undefined

    try {
      const { files }: PickFilesResult = await this.filePicker.pickFiles({ 
        multiple: false,
        readData: false
      })
      const { name, path } = files[0]
      if (!path) {
        throw new Error(`Can't open the file.`)
      }

      loader = await this.uiEventService.getTranslatedLoader({
        message: 'Loading...'
      })
      await loader.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
      const metadata: IsolatedModuleMetadata = await this.moduleService.readModuleMetadata(name, path)

      metadata

      // this.navigationService.routeWithState('/module-preview', { metadata }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (e) {
      console.error('Loading protocol module data failed', e)
      // TODO: show alert
    } finally {
      loader?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
      loader = undefined
    }
  }

  private async goToOnboardingPage(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: IsolatedModulesOnboardingPage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
