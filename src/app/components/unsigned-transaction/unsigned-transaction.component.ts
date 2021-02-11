import { Component, Input, OnChanges } from '@angular/core'
import {
  IACMessageDefinitionObject,
  IAirGapTransaction,
  UnsignedTransaction,
  AirGapWallet,
  IACMessageType,
  ICoinProtocol
} from '@airgap/coinlib-core'
import BigNumber from 'bignumber.js'
import * as bip39 from 'bip39'
import { ProtocolService, SerializerService } from '@airgap/angular-core'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { Secret } from 'src/app/models/secret'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { InteractionOperationType, InteractionService } from 'src/app/services/interaction/interaction.service'
import { AlertController } from '@ionic/angular'
import { TokenService } from 'src/app/services/token/TokenService'
import { SignTransactionInfo } from 'src/app/models/sign-transaction-info'

@Component({
  selector: 'airgap-unsigned-transaction',
  templateUrl: './unsigned-transaction.component.html',
  styleUrls: ['./unsigned-transaction.component.scss']
})
export class UnsignedTransactionComponent implements OnChanges {
  @Input()
  public unsignedTxs: IACMessageDefinitionObject[] | undefined // TODO: Type

  @Input()
  public transactionInfos: SignTransactionInfo[]

  @Input()
  public syncProtocolString: string

  public airGapTxs: IAirGapTransaction[]
  public fallbackActivated: boolean = false
  public broadcastUrl?: string
  public transactionsWithWallets: [UnsignedTransaction, AirGapWallet][]

  public aggregatedInfo:
    | {
        numberOfTxs: number
        totalAmount: BigNumber
        totalFees: BigNumber
      }
    | undefined

  public rawTxData: string

  constructor(
    private readonly alertController: AlertController,
    private readonly protocolService: ProtocolService,
    private readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly interactionService: InteractionService,
    private readonly tokenService: TokenService
  ) {}
  public async ionViewWillEnter(): Promise<void> {
    try {
      this.airGapTxs = (
        await Promise.all(
          this.transactionInfos.map((info) =>
            info.wallet.protocol.getTransactionDetails(info.signTransactionRequest.payload as UnsignedTransaction)
          )
        )
      ).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
    } catch (e) {
      console.error('cannot read tx details', e)
    }
  }

  public async ngOnChanges(): Promise<void> {
    if (this.unsignedTxs && this.unsignedTxs.length > 0) {
      const protocol: ICoinProtocol = await this.protocolService.getProtocol(this.unsignedTxs[0].protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const unsignedTransaction: UnsignedTransaction = this.unsignedTxs[0].payload as UnsignedTransaction
        this.airGapTxs = (
          await Promise.all(this.unsignedTxs.map((unsignedTx) => protocol.getTransactionDetails(unsignedTx.payload as UnsignedTransaction)))
        ).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])

        if (
          this.airGapTxs.length > 1 &&
          this.airGapTxs.every((tx: IAirGapTransaction) => tx.protocolIdentifier === this.airGapTxs[0].protocolIdentifier)
        ) {
          this.aggregatedInfo = {
            numberOfTxs: this.airGapTxs.length,
            totalAmount: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.amount), new BigNumber(0)),
            totalFees: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.fee), new BigNumber(0))
          }
        }

        try {
          if (this.airGapTxs.length !== 1) {
            throw Error('TokenTransferDetails returned more than 1 transaction!')
          }
          this.airGapTxs = [await this.tokenService.getTokenTransferDetails(this.airGapTxs[0], unsignedTransaction)]
        } catch (error) {
          console.error('unable to parse token transaction, using ethereum transaction details instead')
        }

        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        // tslint:disable-next-line:no-unnecessary-type-assertion
        this.rawTxData = JSON.stringify((this.unsignedTxs[0].payload as UnsignedTransaction).transaction)
      }
    }
  }

  public async signAndGoToNextPage(): Promise<void> {
    try {
      const signedTxs: string[] = await Promise.all(
        this.transactionInfos.map((info) => this.signTransaction(info.signTransactionRequest.payload as UnsignedTransaction, info.wallet))
      )
      this.broadcastUrl = await this.generateBroadcastUrl(this.transactionInfos, signedTxs)

      this.interactionService.startInteraction(
        {
          operationType: InteractionOperationType.TRANSACTION_BROADCAST,
          url: this.broadcastUrl,
          wallets: this.transactionInfos.map((info) => info.wallet),
          signedTxs,
          transactions: this.transactionInfos.map((info) => info.signTransactionRequest.payload as UnsignedTransaction)
        },
        this.secretsService.getActiveSecret()
      )
    } catch (error) {
      if (error.message) {
        this.showAlert('Error', error.message)
      }
    }
  }

  private async generateBroadcastUrl(transactionInfos: SignTransactionInfo[], signedTxs: string[]): Promise<string> {
    let txDetails: IAirGapTransaction[] | undefined

    try {
      const transactions = (
        await Promise.all(
          transactionInfos.map((info) =>
            info.wallet.protocol.getTransactionDetails(info.signTransactionRequest.payload as UnsignedTransaction)
          )
        )
      ).reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])

      txDetails = transactions
    } catch (e) {
      handleErrorLocal(e)
    }

    if (txDetails && txDetails.length > 0) {
      const deserializedTxSigningRequests: IACMessageDefinitionObject[] = transactionInfos.map((info, index) => ({
        id: info.signTransactionRequest.id,
        protocol: info.wallet.protocol.identifier,
        type: IACMessageType.TransactionSignResponse,
        payload: {
          accountIdentifier: info.wallet.publicKey.substr(-6),
          transaction: signedTxs[index],
          from: txDetails[index].from,
          amount: txDetails[index].amount,
          fee: txDetails[index].fee,
          to: txDetails[index].to
        }
      }))

      const serializedTx: string[] = await this.serializerService.serialize(deserializedTxSigningRequests)

      const unsignedTransaction = transactionInfos[0].signTransactionRequest.payload as UnsignedTransaction
      return `${unsignedTransaction.callbackURL || 'airgap-wallet://?d='}${serializedTx.join(',')}`
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

    if (await this.checkIfPublicKeysMatch(transaction, wallet, mnemonic, '')) {
      // Public keys match, so no BIP-39 passphrase has been set
      return this.sign(transaction, wallet, mnemonic, '')
    }

    return this.sign(transaction, wallet, mnemonic, await this.showBip39PassphraseAlert())
  }

  private async showBip39PassphraseAlert(): Promise<string> {
    return new Promise(async (resolve) => {
      const alert: HTMLIonAlertElement = await this.alertController.create({
        header: 'BIP-39 Passphrase',
        message: 'If you have set a BIP-39 passphrase, please enter it here.',
        backdropDismiss: false,
        inputs: [
          {
            name: 'bip39Passphrase',
            type: 'password',
            placeholder: 'Passphrase'
          }
        ],
        buttons: [
          {
            text: 'Ok',
            handler: async (result) => {
              const bip39Passphrase = result.bip39Passphrase ?? ''

              resolve(bip39Passphrase)
            }
          }
        ]
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }

  private async showBip39PassphraseMismatchAlert(): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'BIP-39 Passphrase',
      message: 'Public keys do not match. Did you enter the correct BIP-39 Passphrase?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    throw new Error('Public keys do not match. Did you enter the correct BIP-39 Passphrase?')
  }

  private async sign(
    transaction: UnsignedTransaction,
    wallet: AirGapWallet,
    mnemonic: string,
    bip39Passphrase: string = ''
  ): Promise<string> {
    if (wallet.isExtendedPublicKey) {
      const extendedPrivateKey: string = await wallet.protocol.getExtendedPrivateKeyFromMnemonic(
        mnemonic,
        wallet.derivationPath,
        bip39Passphrase
      )
      if (!(await this.checkIfPublicKeysMatch(transaction, wallet, mnemonic, bip39Passphrase))) {
        throw this.showBip39PassphraseMismatchAlert()
      }

      return wallet.protocol.signWithExtendedPrivateKey(extendedPrivateKey, transaction.transaction)
    } else {
      const privateKey: Buffer = await wallet.protocol.getPrivateKeyFromMnemonic(mnemonic, wallet.derivationPath, bip39Passphrase)

      if (!(await this.checkIfPublicKeysMatch(transaction, wallet, mnemonic, bip39Passphrase))) {
        throw this.showBip39PassphraseMismatchAlert()
      }

      return wallet.protocol.signWithPrivateKey(privateKey, transaction.transaction)
    }
  }

  public async showAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: title,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay!',
          role: 'cancel'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  private async checkIfPublicKeysMatch(
    transaction: UnsignedTransaction,
    wallet: AirGapWallet,
    mnemonic: string,
    bip39Passphrase: string = ''
  ) {
    const publicKey: string = await wallet.protocol.getPublicKeyFromMnemonic(mnemonic, wallet.derivationPath, bip39Passphrase)

    return transaction.publicKey === publicKey
  }
}
