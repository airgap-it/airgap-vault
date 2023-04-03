import { IsolatedModuleMetadata, ModulesService, UiEventService } from '@airgap/angular-core'
import { Component, Inject, OnInit } from '@angular/core'
import { FilePickerPlugin, PickFilesResult } from '@capawesome/capacitor-file-picker'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { FILE_PICKER_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-danger-zone',
  templateUrl: './danger-zone.page.html',
  styleUrls: ['./danger-zone.page.scss']
})
export class DangerZonePage implements OnInit {
  constructor(
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    public readonly storageService: VaultStorageService,
    private readonly secureStorage: SecureStorageService,
    private readonly navigationService: NavigationService,
    private readonly moduleService: ModulesService,
    private readonly uiEventService: UiEventService,
    @Inject(FILE_PICKER_PLUGIN) private readonly filePicker: FilePickerPlugin
  ) {}

  ngOnInit() {}

  public async resetVault() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe.alert.title'),
      message: this.translateService.instant('danger-zone.wipe.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe.alert.cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('danger-zone.wipe.alert.ok'),
          handler: async () => {
            try {
              await this.secureStorage.wipe()
              await this.storageService.wipe()
            } catch (e) {
              console.error('Wiping failed', e)
              return this.resetVaultError()
            }

            this.navigationService.route('/').then(() => {
              location.reload()
            })
          }
        }
      ]
    })
    alert.present()
  }

  public async resetVaultError() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe-error.alert.title'),
      message: this.translateService.instant('danger-zone.wipe-error.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe-error.alert.ok')
        }
      ]
    })
    alert.present()
  }

  public async goToIsolatedModules() {
    this.navigationService.route('/isolated-modules-list').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

    return

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

      this.navigationService.routeWithState('/module-preview', { metadata }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } catch (e) {
      console.error('Loading protocol module data failed', e)
      // TODO: show alert
    } finally {
      loader?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
      loader = undefined
    }
  }
}
