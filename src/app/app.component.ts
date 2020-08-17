import { LanguageService, ProtocolService } from '@airgap/angular-core'
import { AfterViewInit, Component, Inject, NgZone } from '@angular/core'
import { AppPlugin, AppUrlOpen, SplashScreenPlugin, StatusBarPlugin, StatusBarStyle } from '@capacitor/core'
import { Platform } from '@ionic/angular'
import { first } from 'rxjs/operators'

import { SecurityUtilsPlugin } from './capacitor-plugins/definitions'
import { APP_PLUGIN, SECURITY_UTILS_PLUGIN, SPLASH_SCREEN_PLUGIN, STATUS_BAR_PLUGIN } from './capacitor-plugins/injection-tokens'
import { DEEPLINK_VAULT_ADD_ACCOUNT, DEEPLINK_VAULT_PREFIX } from './constants/constants'
import { ExposedPromise, exposedPromise } from './functions/exposed-promise'
import { Secret } from './models/secret'
import { ErrorCategory, handleErrorLocal } from './services/error-handler/error-handler.service'
import { NavigationService } from './services/navigation/navigation.service'
import { SchemeRoutingService } from './services/scheme-routing/scheme-routing.service'
import { SecretsService } from './services/secrets/secrets.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'
import { ProtocolsService } from './services/protocols/protocols.service'

declare let window: Window & { airGapHasStarted: boolean }

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
    private readonly schemeRoutingService: SchemeRoutingService,
    private readonly languageService: LanguageService,
    private readonly protocolService: ProtocolService,
    private readonly protocolsService: ProtocolsService,
    private readonly secretsService: SecretsService,
    private readonly ngZone: NgZone,
    private readonly navigationService: NavigationService,
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
    this.protocolsService.addProtocols()
    await Promise.all([this.platform.ready(), this.initializeTranslations()])

    this.initializeProtocols()

    if (this.platform.is('hybrid')) {
      this.statusBar.setStyle({ style: StatusBarStyle.Dark })
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
    this.app.addListener('appUrlOpen', async (data: AppUrlOpen) => {
      await this.isInitialized.promise
      if (data.url === DEEPLINK_VAULT_PREFIX || data.url.startsWith(DEEPLINK_VAULT_ADD_ACCOUNT)) {
        console.log('Successfully matched route', data.url)
        this.secretsService
          .getSecretsObservable()
          .pipe(first())
          .subscribe((secrets: Secret[]) => {
            if (secrets.length > 0) {
              this.ngZone
                .run(async () => {
                  this.navigationService.routeToAccountsTab().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

                  const protocol: string = data.url.substr(DEEPLINK_VAULT_ADD_ACCOUNT.length)
                  if (protocol.length > 0) {
                    this.navigationService
                      .routeWithState('account-add', { protocol })
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
          this.schemeRoutingService.handleNewSyncRequest(data.url).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
        })
      }
    })
  }

  private async initializeTranslations(): Promise<void> {
    return this.languageService.init({
      supportedLanguages: ['en', 'de', 'zh-cn'],
      defaultLanguage: 'en'
    })
  }

  private initializeProtocols(): void {
    this.protocolService.init()
  }
}
