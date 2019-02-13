import { DeepLinkProvider } from './../../providers/deep-link/deep-link'
import { Component, NgZone } from '@angular/core'
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular'
import { ErrorCategory, handleErrorLocal } from '../../providers/error-handler/error-handler'
import {
  AirGapWallet,
  UnsignedTransaction,
  IAirGapTransaction,
  SyncProtocolUtils,
  DeserializedSyncProtocol,
  EncodedType
} from 'airgap-coin-lib'
import { InteractionSelectionPage } from '../interaction-selection/interaction-selection'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import bip39 from 'bip39'
import { TransactionSignedPage } from '../transaction-signed/transaction-signed'
import { InteractionProvider, InteractionOperationType, InteractionSetting } from '../../providers/interaction/interaction'

declare let window: any

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html'
})
export class TransactionDetailPage {
  broadcastUrl?: string

  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTx: IAirGapTransaction

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    private ngZone: NgZone,
    private secretsProvider: SecretsProvider,
    private platform: Platform,
    private deepLinkProvider: DeepLinkProvider,
    private interactionProvider: InteractionProvider
  ) {}

  ionViewWillEnter() {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.airGapTx = this.wallet.coinProtocol.getTransactionDetails(this.transaction)
  }

  async signAndGoToNextPage() {
    const signedTx = await this.signTransaction(this.transaction, this.wallet)
    this.broadcastUrl = await this.generateBroadcastUrl(this.wallet, signedTx, this.transaction)

    this.interactionProvider.startInteraction(
      this.navController,
      {
        operationType: InteractionOperationType.TRANSACTION_BROADCAST,
        url: this.broadcastUrl,
        wallet: this.wallet,
        signedTx: signedTx,
        transaction: this.transaction
      },
      this.secretsProvider.getActiveSecret()
    )
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
  }

  signTransaction(transaction: UnsignedTransaction, wallet: AirGapWallet): Promise<string> {
    const secret = this.secretsProvider.findByPublicKey(wallet.publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found to this public key')
    }

    return this.secretsProvider.retrieveEntropyForSecret(secret).then(entropy => {
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
