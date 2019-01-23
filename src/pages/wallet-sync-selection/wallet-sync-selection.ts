import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'
import { WalletSharePage } from '../wallet-share/wallet-share'

declare var window: any

@IonicPage()
@Component({
  selector: 'page-wallet-sync-selection',
  templateUrl: 'wallet-sync-selection.html'
})
export class WalletSyncSelectionPage {
  private wallet: AirGapWallet
  private walletShareUrl: string

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform) {
    this.wallet = this.navParams.get('wallet')
  }

  async ionViewDidEnter() {
    this.walletShareUrl = await this.generateShareURL()
  }

  goToWalletShare() {
    this.navCtrl.push(WalletSharePage, { walletShareUrl: this.walletShareUrl })
  }

  async generateShareURL(): Promise<string> {
    const syncProtocol = new SyncProtocolUtils()

    const syncWalletRequest: SyncWalletRequest = {
      publicKey: this.wallet.publicKey,
      isExtendedPublicKey: this.wallet.isExtendedPublicKey,
      derivationPath: this.wallet.derivationPath
    }

    const deserializedTxSigningRequest: DeserializedSyncProtocol = {
      version: 1,
      protocol: this.wallet.protocolIdentifier,
      type: EncodedType.WALLET_SYNC,
      payload: syncWalletRequest
    }

    const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)

    return 'airgap-wallet://?d=' + serializedTx
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