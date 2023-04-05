import { BaseModulesService, IsolatedModuleInstalledMetadata, IsolatedModulePreviewMetadata, IsolatedProtocol, ModulesController, ProtocolService, UiEventService } from '@airgap/angular-core'
import { AirGapWallet } from '@airgap/coinlib-core'
import { Inject, Injectable } from '@angular/core'
import { FilePickerPlugin, PickFilesResult } from '@capawesome/capacitor-file-picker'
import { FILE_PICKER_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class VaultModulesService extends BaseModulesService {
  constructor(
    modulesController: ModulesController,
    protocolService: ProtocolService,
    private readonly secretsService: SecretsService,
    private readonly uiEventService: UiEventService,
    @Inject(FILE_PICKER_PLUGIN) private readonly filePicker: FilePickerPlugin
  ) {
    super(modulesController, protocolService)
  }

  public async loadModule(): Promise<IsolatedModulePreviewMetadata> {
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
        message: 'loader.generic.message'
      })
      await loader.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

      return this.readModuleMetadata(name, path)
    } finally {
      loader?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
      loader = undefined
    }
  }

  public async removeInstalledModule(metadata: IsolatedModuleInstalledMetadata, keepAccounts: boolean = false) {
    await this.removeInstalledModules([metadata.module.identifier])
    if (keepAccounts) {
      return
    }

    const allWallets: AirGapWallet[] = this.secretsService.getWallets()
    const allWalletsWithIdentifiers: [AirGapWallet, string][] = await Promise.all(
      allWallets.map(async (wallet: AirGapWallet) => [wallet, await wallet.protocol.getIdentifier()] as [AirGapWallet, string])
    )

    const removedProtocols: Set<string> = new Set(metadata.module.protocols.map((protocol: IsolatedProtocol) => protocol.identifier))
    const toRemoveWallets: AirGapWallet[] = allWalletsWithIdentifiers
      .filter(([_, protocolIdentifier]: [AirGapWallet, string]) => removedProtocols.has(protocolIdentifier))
      .map(([wallet, _]: [AirGapWallet, string]) => wallet)

    await this.secretsService.removeWallets(toRemoveWallets)
  }
}