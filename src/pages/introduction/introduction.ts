import { Component } from '@angular/core'
import { Platform, ViewController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

declare var cordova: any

@Component({
  selector: 'page-introduction',
  templateUrl: 'introduction.html'
})
export class IntroductionPage {
  public security: string = 'highest'

  constructor(private viewController: ViewController, private platform: Platform, private storage: Storage) {}

  accept() {
    this.storage
      .set('INTRODUCTION_INITIAL', true)
      .then(() => {
        this.viewController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      })
      .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
  }

  public downloadClient() {
    this.openUrl('https://github.com/airgap-it')
  }

  public downloadApp() {
    // This should open App Store and not InAppBrowser
    if (this.platform.is('android')) {
      window.open('https://play.google.com/store/apps/details?id=it.airgap.wallet')
    } else if (this.platform.is('ios')) {
      window.open('itms-apps://itunes.apple.com/app/id1420996542') // AirGap Wallet
    }
  }

  private openUrl(url: string) {
    if (this.platform.is('ios') || this.platform.is('android')) {
      cordova.InAppBrowser.open(url, '_system', 'location=true')
    } else {
      window.open(url, '_blank')
    }
  }
}
