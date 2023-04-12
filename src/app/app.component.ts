import { AeternityModule } from '@airgap/aeternity'
import { APP_PLUGIN, createV0TezosShieldedTezProtocol, IACMessageTransport, ICoinProtocolAdapter, ProtocolService, SPLASH_SCREEN_PLUGIN, STATUS_BAR_PLUGIN } from '@airgap/angular-core'
import { AstarModule } from '@airgap/astar'
import { BitcoinModule } from '@airgap/bitcoin'
import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { CoreumModule } from '@airgap/coreum'
import { CosmosModule } from '@airgap/cosmos'
import { EthereumModule } from '@airgap/ethereum'
import { GroestlcoinModule } from '@airgap/groestlcoin'
import { ICPModule } from '@airgap/icp'
import { MoonbeamModule } from '@airgap/moonbeam'
import { PolkadotModule } from '@airgap/polkadot'
import { TezosModule, TezosSaplingExternalMethodProvider, TezosShieldedTezProtocol } from '@airgap/tezos'
import { HttpClient } from '@angular/common/http'
import { AfterViewInit, Component, Inject, NgZone } from '@angular/core'
import { AppPlugin, URLOpenListenerEvent } from '@capacitor/app'
import { SplashScreenPlugin } from '@capacitor/splash-screen'
import { StatusBarPlugin, Style } from '@capacitor/status-bar'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'

import { SecurityUtilsPlugin } from './capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from './capacitor-plugins/injection-tokens'
import { DEEPLINK_VAULT_ADD_ACCOUNT, DEEPLINK_VAULT_PREFIX } from './constants/constants'
import { ExposedPromise, exposedPromise } from './functions/exposed-promise'
import { MnemonicSecret } from './models/secret'
import { ErrorCategory, handleErrorLocal } from './services/error-handler/error-handler.service'
import { IACService } from './services/iac/iac.service'
import { VaultModulesService } from './services/modules/modules.service'
import { NavigationService } from './services/navigation/navigation.service'
import { SaplingNativeService } from './services/sapling-native/sapling-native.service'
import { SecretsService } from './services/secrets/secrets.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { LanguagesType, VaultStorageKey, VaultStorageService } from './services/storage/storage.service'

declare let window: Window & { airGapHasStarted: boolean }

const defer = (fn: () => void) => {
  // fn()
  setTimeout(fn, 200)
}

@Component({
  selector: 'airgap-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements AfterViewInit {
  // Sometimes the deeplink was registered before the root page was set
  // This resulted in the root page "overwriting" the deep-linked page
  public isInitialized: ExposedPromise<void> = exposedPromise<void>()

  constructor(
    private readonly platform: Platform,
    private readonly startupChecks: StartupChecksService,
    private readonly iacService: IACService,
    private readonly translateService: TranslateService,
    private readonly storageService: VaultStorageService,
    private readonly protocolService: ProtocolService,
    private readonly secretsService: SecretsService,
    private readonly ngZone: NgZone,
    private readonly navigationService: NavigationService,
    private readonly httpClient: HttpClient,
    private readonly saplingNativeService: SaplingNativeService,
    private readonly moduleService: VaultModulesService,
    @Inject(APP_PLUGIN) private readonly app: AppPlugin,
    @Inject(SECURITY_UTILS_PLUGIN) private readonly securityUtils: SecurityUtilsPlugin,
    @Inject(SPLASH_SCREEN_PLUGIN) private readonly splashScreen: SplashScreenPlugin,
    @Inject(STATUS_BAR_PLUGIN) private readonly statusBar: StatusBarPlugin
  ) {
    // We set the app as started so no "error alert" will be shown in case the app fails to load. See error-check.js for details.
    window.airGapHasStarted = true
    this.initializeApp().catch(handleErrorLocal(ErrorCategory.OTHER))
  }

  public async initializeApp(): Promise<void> {
    await Promise.all([this.platform.ready(), this.initializeTranslations(), this.initializeProtocols()])

    if (this.platform.is('hybrid')) {
      this.statusBar.setStyle({ style: Style.Dark })
      this.statusBar.setBackgroundColor({ color: '#311B58' })
      this.splashScreen.hide()

      await this.securityUtils.toggleAutomaticAuthentication({ automatic: true })
    }

    this.initChecks()
  }

  public async initChecks(): Promise<void> {
    await this.startupChecks.initChecks()

    this.isInitialized.resolve()
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.platform.ready()
    this.app.addListener('appUrlOpen', async (data: URLOpenListenerEvent) => {
      await this.isInitialized.promise
      if (data.url === DEEPLINK_VAULT_PREFIX || data.url.startsWith(DEEPLINK_VAULT_ADD_ACCOUNT)) {
        console.log('Successfully matched route', data.url)
        this.secretsService
          .getSecretsObservable()
          .pipe(first())
          .subscribe((secrets: MnemonicSecret[]) => {
            if (secrets.length > 0) {
              this.ngZone
                .run(async () => {
                  this.navigationService.routeToSecretsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

                  const protocol: string = data.url.substr(DEEPLINK_VAULT_ADD_ACCOUNT.length)
                  if (protocol.length > 0) {
                    this.navigationService
                      .routeWithState('account-add', { protocol, secret: secrets[0] })
                      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
                  } else {
                    this.navigationService.route('account-add').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
                  }
                })
                .catch(handleErrorLocal(ErrorCategory.OTHER))
            }
          })
      } else {
        this.ngZone.run(async () => {
          // We defer this call because on iOS the app would sometimes get stuck on a black screen when handling deeplinks.
          defer(() =>
            this.iacService.handleRequest(data.url, IACMessageTransport.DEEPLINK).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
          )
        })
      }
    })
  }

  private async initializeTranslations(): Promise<void> {
    this.translateService.setDefaultLang(LanguagesType.EN)

    const savedLanguage = await this.storageService.get(VaultStorageKey.LANGUAGE_TYPE)
    const deviceLanguage = this.translateService.getBrowserLang()
    const currentLanguage = savedLanguage || (deviceLanguage as LanguagesType)

    await this.translateService.use(currentLanguage).toPromise()
  }

  private async initializeProtocols(): Promise<void> {
    this.moduleService.init([
      new BitcoinModule(),
      new EthereumModule(),
      new TezosModule(),
      new PolkadotModule(),
      new CosmosModule(),
      new AeternityModule(),
      new GroestlcoinModule(),
      new MoonbeamModule(),
      new AstarModule(),
      new ICPModule(),
      new CoreumModule()
    ])
    const protocols = await this.moduleService.loadProtocols('offline', [MainProtocolSymbols.XTZ_SHIELDED])

    const externalMethodProvider: TezosSaplingExternalMethodProvider | undefined =
      await this.saplingNativeService.createExternalMethodProvider()

    const shieldedTezAdapter: ICoinProtocolAdapter<TezosShieldedTezProtocol> = await createV0TezosShieldedTezProtocol({ externalProvider: externalMethodProvider })
    
    this.protocolService.init({
      activeProtocols: protocols.activeProtocols,
      passiveProtocols: protocols.passiveProtocols,
      extraActiveProtocols: [shieldedTezAdapter],
      activeSubProtocols: protocols.activeSubProtocols,
      passiveSubProtocols: protocols.passiveSubProtocols
    })

    await shieldedTezAdapter.protocolV1.initParameters(await this.getSaplingParams('spend'), await this.getSaplingParams('output'))
  }

  private async getSaplingParams(type: 'spend' | 'output'): Promise<Buffer> {
    if (this.platform.is('hybrid')) {
      // Sapling params are read and used in a native plugin, there's no need to read them in the Ionic part
      return Buffer.alloc(0)
    }

    const params: ArrayBuffer = await this.httpClient
      .get(`./assets/sapling/sapling-${type}.params`, { responseType: 'arraybuffer' })
      .toPromise()

    return Buffer.from(params)
  }
}
