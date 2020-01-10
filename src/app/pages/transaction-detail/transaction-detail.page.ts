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

@Component({
  selector: 'airgap-transaction-detail',
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss']
})
export class TransactionDetailPage {
  public broadcastUrl?: string

  public transaction: UnsignedTransaction
  public wallet: AirGapWallet
  public airGapTxs: IAirGapTransaction[]
  public deserializedSync: IACMessageDefinitionObject[]

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService,
    private readonly serializerService: SerializerService,
    private readonly alertCtrl: AlertController
  ) {}

  public async ionViewWillEnter(): Promise<void> {
    this.transaction = this.navigationService.getState().transaction
    this.wallet = this.navigationService.getState().wallet
    this.deserializedSync = [this.navigationService.getState().deserializedSync]
    console.log('deserialized sync', this.deserializedSync)
    try {
      this.airGapTxs = await this.wallet.coinProtocol.getTransactionDetails(this.transaction)
    } catch (e) {
      console.log('cannot read tx details', e)
    }
  }

  public async signAndGoToNextPage(): Promise<void> {
    try {
      const signedTx: string = await this.signTransaction(this.transaction, this.wallet)
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
      } catch (error) {
        console.log("Caught error: ", error)
      }
  }

  public async generateBroadcastUrl(wallet: AirGapWallet, signedTx: string, unsignedTransaction: UnsignedTransaction): Promise<string> {
    let txDetails: IAirGapTransaction | undefined

    try {
      const transactions = await wallet.coinProtocol.getTransactionDetails(unsignedTransaction) // TODO: Look at all transactions
      console.log(transactions)

      txDetails = transactions[0]
    } catch (e) {
      handleErrorLocal(e)
    }

    if (txDetails) {
      const deserializedTxSigningRequest: IACMessageDefinitionObject = {
        protocol: this.wallet.protocolIdentifier,
        type: IACMessageType.TransactionSignResponse,
        payload: {
          accountIdentifier: wallet.publicKey.substr(-6),
          transaction: signedTx,
          from: txDetails.from,
          amount: txDetails.amount,
          fee: txDetails.fee,
          to: txDetails.to
        }
      }

      const serializedTx: string[] = await this.serializerService.serialize([deserializedTxSigningRequest])

      return `${unsignedTransaction.callback || 'airgap-wallet://?d='}${serializedTx.join(',')}`
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

    try {
      const entropy = await this.secretsService.retrieveEntropyForSecret(secret)

      const seed: string = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
      if (wallet.isExtendedPublicKey) {
        const extendedPrivateKey: string = wallet.coinProtocol.getExtendedPrivateKeyFromHexSecret(seed, wallet.derivationPath)

        return wallet.coinProtocol.signWithExtendedPrivateKey(extendedPrivateKey, transaction.transaction)
      } else {
        const privateKey: Buffer = wallet.coinProtocol.getPrivateKeyFromHexSecret(seed, wallet.derivationPath)

        return wallet.coinProtocol.signWithPrivateKey(privateKey, transaction.transaction)
      }
    } catch(error) {
       // TODO: test if secret recovery is working and set up a better UI
       console.log(error)
       if (typeof error === 'string' && error.includes('Wrong master key')) {
          this.showRecoveryAlert(secret)
        }
        throw error
    }
  }

  private async showRecoveryAlert(secret: Secret): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: 'Secret recovery',
      message: '',
      backdropDismiss: false,
      inputs: [
        {
          name: 'recoveryKey',
          placeholder: 'Recovery Key'
        }
      ],
      buttons: [
        {
          text: 'Okay!',
          handler: async data => {
            await this.secretsService.recoverSecret(secret, data.recoveryKey)
          }
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
