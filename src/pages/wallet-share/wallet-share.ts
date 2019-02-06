import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { AirGapWallet } from 'airgap-coin-lib'
import { ShareUrlProvider } from '../../providers/share-url/share-url'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

declare var window: any

@IonicPage()
@Component({
  selector: 'page-wallet-share',
  templateUrl: 'wallet-share.html'
})
export class WalletSharePage {
  private wallet: AirGapWallet
  private walletShareUrl: string

  constructor(
    private navController: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private shareUrlProvider: ShareUrlProvider
  ) {
    this.wallet = this.navParams.get('wallet')
  }

  done() {
    this.navController.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async ionViewDidEnter() {
    this.walletShareUrl = await this.shareUrlProvider.generateShareURL(this.wallet)
  }

  async sameDeviceSync() {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: this.walletShareUrl,
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(this.walletShareUrl)
    }

    sApp.start(
      () => {
        console.log('OK')
      },
      () => {
        alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
      }
    )
  }
}
