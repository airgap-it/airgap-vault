import { Component } from '@angular/core'

import { Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'

import { ExposedPromise, exposedPromise } from './functions/exposed-promise'

declare let window: Window & { airGapHasStarted: boolean }

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  // Sometimes the deeplink was registered before the root page was set
  // This resulted in the root page "overwriting" the deep-linked page
  isInitialized: ExposedPromise<void> = exposedPromise<void>()

  constructor(private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar) {
    // We set the app as started so no "error alert" will be shown in case the app fails to load. See error-check.js for details.
    window.airGapHasStarted = true

    this.initializeApp() // .catch(handleErrorLocal(ErrorCategory.OTHER))
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    })
  }
}
