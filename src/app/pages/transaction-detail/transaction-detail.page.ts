import { AlertService } from './../../services/alert/alert.service'
import { Component } from '@angular/core'
import { AirGapWallet, IACMessageDefinitionObject, IACMessageType, IAirGapTransaction, UnsignedTransaction } from 'airgap-coin-lib'
import * as bip39 from 'bip39'

import { Secret } from '../../models/secret'
import { handleErrorLocal, ErrorCategory } from '../../services/error-handler/error-handler.service'
import { InteractionOperationType, InteractionService } from '../../services/interaction/interaction.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { SerializerService } from '../../services/serializer/serializer.service'
import { AlertController } from '@ionic/angular'

// TODO: refactor multiple transactions
@Component({
  selector: 'airgap-transaction-detail',
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss']
})
export class TransactionDetailPage {
  public broadcastUrl?: string

  public transactionsWithWallets: [UnsignedTransaction, AirGapWallet][]
  public airGapTxs: IAirGapTransaction[]
  public deserializedSync: IACMessageDefinitionObject[]

  constructor(
    private readonly alertCtrl: AlertController,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService,
    private readonly serializerService: SerializerService,
    private alertService: AlertService
  ) {}

  public async ionViewWillEnter(): Promise<void> {
    const state = this.navigationService.getState()
    if (state.transactionsWithWallets) {
      this.transactionsWithWallets = state.transactionsWithWallets
      this.deserializedSync = state.deserializedSync
      console.log('deserialized sync', this.deserializedSync)
      try {
        this.airGapTxs = (
          await Promise.all(
            this.transactionsWithWallets.map((pair: [UnsignedTransaction, AirGapWallet]) =>
              pair[1].coinProtocol.getTransactionDetails(pair[0])
            )
          )
        ).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
      } catch (e) {
        console.log('cannot read tx details', e)
      }
    }
  }

  public async signAndGoToNextPage(): Promise<void> {
    try {
      const signedTxs: string[] = await Promise.all(
        this.transactionsWithWallets.map((pair: [UnsignedTransaction, AirGapWallet]) => this.signTransaction(pair[0], pair[1]))
      )
      this.broadcastUrl = await this.generateBroadcastUrl(this.transactionsWithWallets, signedTxs)

      this.interactionService.startInteraction(
        {
          operationType: InteractionOperationType.TRANSACTION_BROADCAST,
          url: this.broadcastUrl,
          wallets: this.transactionsWithWallets.map((pair) => pair[1]),
          signedTxs,
          transactions: this.transactionsWithWallets.map((pair) => pair[0])
        },
        this.secretsService.getActiveSecret()
      )
    } catch (error) {
      console.log('Caught error: ', error)
      if (error.message) {
        this.alertService.showErrorAlert('Error', error.message)
      }
    }
  }

  public async generateBroadcastUrl(transactionsWithWallets: [UnsignedTransaction, AirGapWallet][], signedTxs: string[]): Promise<string> {
    let txDetails: IAirGapTransaction[] | undefined

    try {
      const transactions = (
        await Promise.all(
          transactionsWithWallets.map((pair: [UnsignedTransaction, AirGapWallet]) => pair[1].coinProtocol.getTransactionDetails(pair[0]))
        )
      ).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
      console.log(transactions)

      txDetails = transactions
    } catch (e) {
      handleErrorLocal(e)
    }

    if (txDetails && txDetails.length > 0) {
      const deserializedTxSigningRequests: IACMessageDefinitionObject[] = transactionsWithWallets.map(
        (pair: [UnsignedTransaction, AirGapWallet], index: number) => ({
          protocol: pair[1].protocolIdentifier,
          type: IACMessageType.TransactionSignResponse,
          payload: {
            accountIdentifier: pair[1].publicKey.substr(-6),
            transaction: signedTxs[index],
            from: txDetails[index].from,
            amount: txDetails[index].amount,
            fee: txDetails[index].fee,
            to: txDetails[index].to
          }
        })
      )

      const serializedTx: string[] = await this.serializerService.serialize(deserializedTxSigningRequests)

      return `${transactionsWithWallets[0][0].callback || 'airgap-wallet://?d='}${serializedTx.join(',')}`
    } else {
      throw new Error('Could not get transaction details')
    }
  }

  public async signTransaction(transaction: UnsignedTransaction, wallet: AirGapWallet): Promise<string> {
    const secret: Secret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found for this public key')
      throw new Error('no secret found for this public key')
    }

    const entropy = await this.secretsService.retrieveEntropyForSecret(secret)

    const mnemonic: string = bip39.entropyToMnemonic(entropy)
    if (wallet.isExtendedPublicKey) {
      const extendedPrivateKey: string = await wallet.coinProtocol.getExtendedPrivateKeyFromMnemonic(mnemonic, wallet.derivationPath)
      return wallet.coinProtocol.signWithExtendedPrivateKey(extendedPrivateKey, transaction.transaction)
    } else {
      const privateKey: Buffer = await wallet.coinProtocol.getPrivateKeyFromMnemonic(mnemonic, wallet.derivationPath)
      return wallet.coinProtocol.signWithPrivateKey(privateKey, transaction.transaction)
    }
  }
}
