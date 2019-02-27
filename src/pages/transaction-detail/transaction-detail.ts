import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import {
  AirGapWallet,
  UnsignedTransaction,
  IAirGapTransaction,
  SyncProtocolUtils,
  DeserializedSyncProtocol,
  EncodedType
} from 'airgap-coin-lib'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import bip39 from 'bip39'
import { InteractionProvider, InteractionOperationType } from '../../providers/interaction/interaction'
import { handleErrorLocal } from '../../providers/error-handler/error-handler'

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
  public deserializedSync: DeserializedSyncProtocol

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    private secretsProvider: SecretsProvider,
    private interactionProvider: InteractionProvider
  ) {}

  async ionViewWillEnter() {
    this.transaction = this.navParams.get('transaction')
    this.wallet = this.navParams.get('wallet')
    this.deserializedSync = this.navParams.get('deserializedSync')
    try {
      this.airGapTx = await this.wallet.coinProtocol.getTransactionDetails(this.transaction)
    } catch (e) {
      console.log('cannot read tx details', e)
    }
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
    let txDetails = {
      from: undefined,
      amount: undefined,
      fee: undefined,
      to: undefined
    }

    try {
      txDetails = await wallet.coinProtocol.getTransactionDetails(unsignedTransaction)
    } catch (e) {
      handleErrorLocal(e)
    }

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
