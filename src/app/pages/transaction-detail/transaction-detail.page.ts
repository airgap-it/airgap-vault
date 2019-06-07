import { Component } from '@angular/core'
import {
  AirGapWallet,
  DeserializedSyncProtocol,
  EncodedType,
  IAirGapTransaction,
  SyncProtocolUtils,
  UnsignedTransaction
} from 'airgap-coin-lib'
import * as bip39 from 'bip39'

import { handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-transaction-detail',
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss']
})
export class TransactionDetailPage {
  public broadcastUrl?: string

  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTx: IAirGapTransaction
  public deserializedSync: DeserializedSyncProtocol

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService
  ) {}

  public async ionViewWillEnter() {
    this.transaction = this.navigationService.getState().transaction
    this.wallet = this.navigationService.getState().wallet
    this.deserializedSync = this.navigationService.getState().deserializedSync
    try {
      this.airGapTx = await this.wallet.coinProtocol.getTransactionDetails(this.transaction)
    } catch (e) {
      console.log('cannot read tx details', e)
    }
  }

  public async signAndGoToNextPage() {
    const signedTx = await this.signTransaction(this.transaction, this.wallet)
    this.broadcastUrl = await this.generateBroadcastUrl(this.wallet, signedTx, this.transaction)

    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.TRANSACTION_BROADCAST,
        url: this.broadcastUrl,
        wallet: this.wallet,
        signedTx,
        transaction: this.transaction
      },
      this.secretsService.getActiveSecret()
    )
  }

  public async generateBroadcastUrl(wallet: AirGapWallet, signedTx: string, unsignedTransaction: UnsignedTransaction): Promise<string> {
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

  public signTransaction(transaction: UnsignedTransaction, wallet: AirGapWallet): Promise<string> {
    const secret = this.secretsService.findByPublicKey(wallet.publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found to this public key')
    }

    return this.secretsService.retrieveEntropyForSecret(secret).then(entropy => {
      const seed = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
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
