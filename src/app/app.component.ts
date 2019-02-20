import { Component, ViewChild } from '@angular/core'
import { Platform, Nav } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { TabsPage } from '../pages/tabs/tabs'
import { Deeplinks } from '@ionic-native/deeplinks'
import { StartupChecksProvider } from '../providers/startup-checks/startup-checks.provider'
import { SchemeRoutingProvider } from '../providers/scheme-routing/scheme-routing'
import { TranslateService } from '@ngx-translate/core'
import { ProtocolsProvider } from '../providers/protocols/protocols'

interface FlatPromise<T> {
  promise: Promise<T>
  resolve: (value?: any | PromiseLike<void>) => void
  reject: (reason?: any) => void
}

function flatPromise<T>(): FlatPromise<T> {
  let resolve, reject

  // tslint:disable-next-line:promise-must-complete
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav

  rootPage: any = null

  isInitializedFlatPromise: FlatPromise<void> = flatPromise<void>()

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private deepLinks: Deeplinks,
    private startupChecks: StartupChecksProvider,
    private schemeRoutingProvider: SchemeRoutingProvider,
    private translate: TranslateService,
    private protocolsProvider: ProtocolsProvider
  ) {
    this.protocolsProvider.addProtocols()
    this.platform
      .ready()
      .then(() => {
        if (this.platform.is('cordova')) {
          this.statusBar.styleLightContent()
          this.statusBar.backgroundColorByHexString('#311B58')
          this.splashScreen.hide()
        }
        const supportedLanguages = ['en', 'de', 'zh-cn']

        for (const lang of supportedLanguages) {
          // We bundle languages because so we don't have to load it over http
          // and we don't need to add a CSP rule for it.
          this.translate.setTranslation(lang, require(`../assets/i18n/${lang}.json`))
        }

        this.translate.setDefaultLang('en')

        const language = this.translate.getBrowserLang()
        if (language) {
          const lowerCaseLanguage = language.toLowerCase()
          supportedLanguages.forEach(supportedLanguage => {
            if (supportedLanguage.startsWith(lowerCaseLanguage)) {
              this.translate.use(supportedLanguage)
            }
          })
        }

        this.initChecks()
      })
      .catch(console.error)
  }

  initChecks() {
    this.startupChecks
      .initChecks()
      .then(async () => {
        await this.nav.setRoot(TabsPage)
        this.isInitializedFlatPromise.resolve()
      })
      .catch(async check => {
        check.consequence(this.initChecks.bind(this))
        this.isInitializedFlatPromise.reject(`startup check failed ${check.name}`) // If we are here, we cannot sign a transaction (no secret, rooted, etc)
      })
  }

  async ngAfterViewInit() {
    await this.platform.ready()
    this.deepLinks
      .route({
        '/': undefined
      })
      .subscribe(
        async match => {
          // match.$route - the route we matched, which is the matched entry from the arguments to route()
          // match.$args - the args passed in the link
          // match.$link - the full link data
          this.isInitializedFlatPromise.promise
            .then(() => {
              console.log('Successfully matched route', match)
              this.schemeRoutingProvider.handleNewSyncRequest(this.nav, match.$link.url).catch(console.error)
            })
            .catch(console.error)
        },
        nomatch => {
          // nomatch.$link - the full link data
          console.error("Got a deeplink that didn't match", nomatch)
        }
      )
  }
}
