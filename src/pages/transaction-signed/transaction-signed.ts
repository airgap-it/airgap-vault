import { Component, NgZone } from '@angular/core'
import { IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import bip39 from 'bip39'
import {
  AirGapWallet,
  SyncProtocolUtils,
  DeserializedSyncProtocol,
  EncodedType,
  UnsignedTransaction,
  IAirGapTransaction
} from 'airgap-coin-lib'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

declare var window: any

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
  signedTxQr?: string
  broadcastUrl?: string

  transaction: UnsignedTransaction
  airGapTx: IAirGapTransaction
  wallet: AirGapWallet

  qrType: TransactionQRType = 0

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private secretProvider: SecretsProvider,
    private ngZone: NgZone,
    private platform: Platform
  ) {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  async ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Signing...'
    })

    loading.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

    const signedTx = await this.signTransaction(this.transaction, this.wallet)
    this.broadcastUrl = await this.generateBroadcastUrl(this.wallet, signedTx, this.transaction)

    this.ngZone.run(() => {
      this.signedTxQr = signedTx
    })
    loading.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
  }

  signTransaction(transaction: UnsignedTransaction, wallet: AirGapWallet): Promise<string> {
    const secret = this.secretProvider.findByPublicKey(wallet.publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found to this public key')
    }

    return this.secretProvider.retrieveEntropyForSecret(secret).then(entropy => {
      let seed = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
      if (wallet.isExtendedPublicKey) {
        const extendedPrivateKey = wallet.coinProtocol.getExtendedPrivateKeyFromHexSecret(seed, wallet.derivationPath)
        return wallet.coinProtocol.signWithExtendedPrivateKey(extendedPrivateKey, transaction.transaction)
      } else {
        const privateKey = wallet.coinProtocol.getPrivateKeyFromHexSecret(seed, wallet.derivationPath)
        return wallet.coinProtocol.signWithPrivateKey(privateKey, transaction.transaction)
      }
    })
  }

  switchQR() {
    this.qrType = this.qrType === TransactionQRType.SignedAirGap ? TransactionQRType.SignedRaw : TransactionQRType.SignedAirGap
  }

  async generateBroadcastUrl(wallet: AirGapWallet, signedTx: string, unsignedTransaction: UnsignedTransaction): Promise<string> {
    const txDetails = wallet.coinProtocol.getTransactionDetails(unsignedTransaction)
    const syncProtocol = new SyncProtocolUtils()
    const deserializedTxSigningRequest: DeserializedSyncProtocol = {
      version: 1,
      protocol: this.wallet.protocolIdentifier,
      type: EncodedType.SIGNED_TRANSACTION,
      payload: {
        accountIdentifier: wallet.publicKey.substr(-6),
        transaction: signedTx,
        from: txDetails.from,
        amount: txDetails.amount,
        fee: txDetails.fee,
        to: txDetails.to
      }
    }

    const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)

    return `${unsignedTransaction.callback || 'airgap-wallet://?d='}${serializedTx}`

    /*
    const data = JSON.stringify({
      from: this.transaction.from,
      to: this.transaction.to,
      amount: this.transaction.amount,
      fee: this.transaction.fee,
      protocolIdentifier: this.wallet.protocolIdentifier,
      payload: signedTx
    })

    return 'airgap-wallet://broadcast?data=' + btoa(data)
    */
  }

  sameDeviceBroadcast() {
    let sApp

    if (this.platform.is('android')) {
      sApp = window.startApp.set({
        action: 'ACTION_VIEW',
        uri: this.broadcastUrl,
        flags: ['FLAG_ACTIVITY_NEW_TASK']
      })
    } else if (this.platform.is('ios')) {
      sApp = window.startApp.set(this.broadcastUrl)
    }

    sApp.start(
      () => {
        console.log('OK')
      },
      error => {
        console.warn(error)
        alert('Oops. Something went wrong here. Do you have AirGap Wallet installed on the same Device?')
      }
    )
  }

  done() {
    this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
