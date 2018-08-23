import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { AirGapWallet } from 'airgap-coin-lib'

declare var window: any

/**
 * Generated class for the WalletSharePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet-share',
  templateUrl: 'wallet-share.html'
})
export class WalletSharePage {

  private wallet: AirGapWallet

  constructor(private navController: NavController, private navParams: NavParams, private platform: Platform) {
    this.wallet = this.navParams.get('wallet')
  }

  done() {
    this.navController.pop()
  }

  walletShareUrl(): string {
    const data = JSON.stringify({
      publicKey: this.wallet.publicKey,
      isExtendedPublicKey: this.wallet.isExtendedPublicKey,
      protocolIdentifier: this.wallet.protocolIdentifier,
      derivationPath: this.wallet.derivationPath
    })

    return 'airgap-wallet://import?data=' + btoa(data)
  }

  sameDeviceSync() {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: this.walletShareUrl(),
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(this.walletShareUrl())
    }

    sApp.start(() => {
      console.log('OK')
    }, () => {
      alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
    })
  }
}
