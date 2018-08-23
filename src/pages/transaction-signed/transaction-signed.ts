import { Component, NgZone } from '@angular/core'
import { IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular'
import { Transaction } from '../../models/transaction.model'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import bip39 from 'bip39'
import { AirGapWallet } from 'airgap-coin-lib'

declare var window: any

/**
 * Generated class for the TransactionSignedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

enum TransactionQRType {
  SignedAirGap = 0,
  SignedRaw = 1
}

@IonicPage()
@Component({
  selector: 'page-transaction-signed',
  templateUrl: 'transaction-signed.html'
})
export class TransactionSignedPage {

  signed: string

  transaction: Transaction
  wallet: AirGapWallet

  qrType: TransactionQRType = 0

  constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams, private secretProvider: SecretsProvider, private ngZone: NgZone, private platform: Platform) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Signing...'
    })

    loading.present()

    this.signTransaction(this.transaction, this.wallet).then(signed => {
      loading.dismiss()
      this.ngZone.run(() => {
        this.signed = signed
      })
    })
  }

  signTransaction(transaction: Transaction, wallet: AirGapWallet): Promise<string> {
    const secret = this.secretProvider.findByPublicKey(wallet.publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found to this public key')
    }

    return this.secretProvider.retrieveEntropyForSecret(secret).then(entropy => {
      let seed = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
      if (wallet.isExtendedPublicKey) {
        const extendedPrivateKey = wallet.coinProtocol.getExtendedPrivateKeyFromHexSecret(seed, wallet.derivationPath)
        return wallet.coinProtocol.signWithExtendedPrivateKey(extendedPrivateKey, transaction.payload)
      } else {
        const privateKey = wallet.coinProtocol.getPrivateKeyFromHexSecret(seed, wallet.derivationPath)
        return wallet.coinProtocol.signWithPrivateKey(privateKey, transaction.payload)
      }
    })
  }

  switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  broadcastURL(signedTx: string): string {
    const data = JSON.stringify({
      from: this.transaction.from,
      to: this.transaction.to,
      amount: this.transaction.amount,
      fee: this.transaction.fee,
      protocolIdentifier: this.wallet.protocolIdentifier,
      payload: signedTx
    })

    return 'airgap-wallet://broadcast?data=' + btoa(data)
  }

  sameDeviceBroadcast() {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: this.broadcastURL(this.signed),
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(this.broadcastURL(this.signed))
    }

    sApp.start(() => {
      console.log('OK')
    }, (error) => {
      console.warn(error)
      alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
    })
  }

  done() {
    this.navCtrl.popToRoot()
  }

}
