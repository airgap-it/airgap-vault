import { Component } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'
import { Storage } from '@ionic/storage'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

declare let cordova: any

@Component({
  selector: 'airgap-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss']
})
export class IntroductionPage {
  public security: string = 'highest'

  constructor(private readonly modalController: ModalController, private readonly platform: Platform, private readonly storage: Storage) {}

  public accept() {
    this.storage
      .set('INTRODUCTION_INITIAL', true)
      .then(() => {
        this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
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
