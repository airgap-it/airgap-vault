import { Component, NgZone } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import {
  AirGapWallet,
  UnsignedTransaction,
  IAirGapTransaction,
  SyncProtocolUtils,
  DeserializedSyncProtocol,
  EncodedType
} from 'airgap-coin-lib'
import { TransactionBroadcastSelectionPage } from '../transaction-broadcast-selection/transaction-broadcast-selection'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import bip39 from 'bip39'

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html'
})
export class TransactionDetailPage {
  broadcastUrl?: string
  signedTxQr?: string

  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTx: IAirGapTransaction

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private ngZone: NgZone,
    private secretProvider: SecretsProvider
  ) {}

  ionViewWillEnter() {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  async signAndGoToTransactionBroadcastSelectionPage() {
    const signedTx = await this.signTransaction(this.transaction, this.wallet)
    this.broadcastUrl = await this.generateBroadcastUrl(this.wallet, signedTx, this.transaction)

    this.ngZone.run(() => {
      this.signedTxQr = signedTx
    })

    this.navController
      .push(TransactionBroadcastSelectionPage, {
        transaction: this.transaction,
        wallet: this.wallet,
        broadcastUrl: this.broadcastUrl,
        signedTxQr: this.signedTxQr
      })
      .then(null)
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

    return (unsignedTransaction.callback || 'airgap-wallet://?d=') + serializedTx
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
}
