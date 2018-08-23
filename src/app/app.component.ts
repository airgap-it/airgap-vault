import { Component, ViewChild } from '@angular/core'
import { Platform, Nav } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { TabsPage } from '../pages/tabs/tabs'
import { Deeplinks } from '@ionic-native/deeplinks'
import { TransactionDetailPage } from '../pages/transaction-detail/transaction-detail'
import { StartupChecksProvider } from '../providers/startup-checks/startup-checks.provider'

@Component({
  templateUrl: 'app.html'
})

export class MyApp {

  @ViewChild(Nav) nav: Nav

  rootPage: any = null

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private deepLinks: Deeplinks,
    private startupChecks: StartupChecksProvider
  ) {

    this.platform.ready().then(() => {
      if (platform.is('cordova')) {
        statusBar.styleLightContent()
        statusBar.backgroundColorByHexString('#311B58')
        splashScreen.hide()
      }

      this.initChecks()

    })
  }

  initChecks() {
    this.startupChecks.initChecks().then(() => {
      this.rootPage = TabsPage
    }).catch((check) => {
      check.consequence(this.initChecks.bind(this))
    })
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.deepLinks.routeWithNavController(this.nav, {
        '/sign': TransactionDetailPage
      }).subscribe((match) => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        console.log('Successfully matched route', match)
      }, (nomatch) => {
        // nomatch.$link - the full link data
        console.error('Got a deeplink that didn\'t match', nomatch)
      })
    })
  }

}
