import { AfterViewInit, Component, NgZone } from '@angular/core'
import { Plugins, StatusBarStyle, AppUrlOpen } from '@capacitor/core'
import { Platform } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'

import { DEEPLINK_VAULT_ADD_ACCOUNT, DEEPLINK_VAULT_PREFIX } from './constants/constants'
import { ExposedPromise, exposedPromise } from './functions/exposed-promise'
import { Secret } from './models/secret'
import { ErrorCategory, handleErrorLocal } from './services/error-handler/error-handler.service'
import { NavigationService } from './services/navigation/navigation.service'
import { ProtocolsService } from './services/protocols/protocols.service'
import { SchemeRoutingService } from './services/scheme-routing/scheme-routing.service'
import { SecretsService } from './services/secrets/secrets.service'
import { StartupChecksService } from './services/startup-checks/startup-checks.service'

declare let window: Window & { airGapHasStarted: boolean }
declare var SecurityUtils: any

const { App, SplashScreen, StatusBar } = Plugins

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
    private readonly translate: TranslateService,
    private readonly protocolsService: ProtocolsService,
    private readonly secretsService: SecretsService,
    private readonly ngZone: NgZone,
    private readonly navigationService: NavigationService
  ) {
    // We set the app as started so no "error alert" will be shown in case the app fails to load. See error-check.js for details.
    window.airGapHasStarted = true

    this.initializeApp().catch(handleErrorLocal(ErrorCategory.OTHER))
  }

  public async initializeApp(): Promise<void> {
    const supportedLanguages: string[] = ['en', 'de', 'zh-cn']
    for (const lang of supportedLanguages) {
      // We bundle languages so we don't have to load it over http
      // and we don't have to add a CSP / whitelist rule for it.
      this.translate.setTranslation(lang, require(`../assets/i18n/${lang}.json`))
      // TODO: Once we add more languages, we probably should not all languages by default
      // (we have to check if we can optimize that)
    }

    this.loadLanguages(supportedLanguages)
    this.protocolsService.addProtocols()

    await this.platform.ready()

    if (this.platform.is('hybrid')) {
      StatusBar.setStyle({ 'style': StatusBarStyle.Dark })
      StatusBar.setBackgroundColor({ 'color': '#311B58' })
      SplashScreen.hide()

      SecurityUtils.LocalAuthentication.toggleAutomaticAuthentication(true)
    }

    this.initChecks()
  }

  public loadLanguages(supportedLanguages: string[]): void {
    this.translate.setDefaultLang('en')

    const language: string = this.translate.getBrowserLang()

    if (language) {
      const lowerCaseLanguage: string = language.toLowerCase()
      supportedLanguages.forEach((supportedLanguage: string) => {
        if (supportedLanguage.startsWith(lowerCaseLanguage)) {
          this.translate.use(supportedLanguage)
        }
      })
    }
  }

  public async initChecks(): Promise<void> {
    await this.startupChecks.initChecks()

    this.isInitialized.resolve()
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.platform.ready()
    App.addListener("appUrlOpen", async (data: AppUrlOpen) => {
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
}
