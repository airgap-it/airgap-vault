import { Injectable } from '@angular/core'
import { AlertController, AlertButton, App, NavController } from 'ionic-angular'
import { DeserializedSyncProtocol, UnsignedTransaction, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'
import { SecretsProvider } from '../secrets/secrets.provider'
import { TransactionDetailPage } from '../../pages/transaction-detail/transaction-detail'

@Injectable()
export class SchemeRoutingProvider {
  private navController: NavController
  private syncSchemeHandlers: {
    [key in EncodedType]: (deserializedSync: DeserializedSyncProtocol, scanAgainCallback: Function) => Promise<boolean>
  }

  constructor(protected app: App, private secretsProvider: SecretsProvider, private alertController: AlertController) {
    this.syncSchemeHandlers = {
      [EncodedType.WALLET_SYNC]: this.syncTypeNotSupportedAlert.bind(this),
      [EncodedType.UNSIGNED_TRANSACTION]: this.handleUnsignedTransaction.bind(this),
      [EncodedType.SIGNED_TRANSACTION]: this.syncTypeNotSupportedAlert.bind(this)
    }
  }

  async handleNewSyncRequest(
    navCtrl: NavController,
    rawString: string,
    scanAgainCallback: Function = () => {
      /* */
    }
  ) {
    this.navController = navCtrl
    const syncProtocol = new SyncProtocolUtils()

    let url = new URL(rawString)
    let d = url.searchParams.get('d')

    if (d.length === 0) {
      d = rawString // Fallback to support raw data QRs
    }

    try {
      const deserializedSync = await syncProtocol.deserialize(d)

      if (deserializedSync.type in EncodedType) {
        // Only handle types that we know
        return this.syncSchemeHandlers[deserializedSync.type](deserializedSync, scanAgainCallback)
      } else {
        return this.syncTypeNotSupportedAlert(deserializedSync, scanAgainCallback)
      }
    } catch (e) {
      console.error('Deserialization of sync failed', e)
    }
  }

  async handleUnsignedTransaction(deserializedSyncProtocol: DeserializedSyncProtocol, scanAgainCallback: Function) {
    const unsignedTransaction = deserializedSyncProtocol.payload as UnsignedTransaction

    const correctWallet = this.secretsProvider.findWalletByPublicKeyAndProtocolIdentifier(
      unsignedTransaction.publicKey,
      deserializedSyncProtocol.protocol
    )

    if (!correctWallet) {
      const cancelButton = {
        text: 'Okay!',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }
      this.showAlert(
        'No secret found',
        'You do not have any compatible wallet for this public key in AirGap. Please import your secret and create the corresponding wallet to sign this transaction',
        [cancelButton]
      )
    } else {
      if (this.navController) {
        this.navController.push(TransactionDetailPage, {
          transaction: unsignedTransaction,
          wallet: correctWallet
        })
      }
    }
  }

  private async syncTypeNotSupportedAlert(deserializedSyncProtocol: DeserializedSyncProtocol, scanAgainCallback: Function) {
    const cancelButton = {
      text: 'Okay!',
      role: 'cancel',
      handler: () => {
        scanAgainCallback()
      }
    }
    this.showAlert('Sync type not supported', 'Please use another app to scan this QR.', [cancelButton])
  }

  async showAlert(title: string, message: string, buttons: AlertButton[]) {
    let alert = this.alertController.create({
      title,
      message,
      enableBackdropDismiss: false,
      buttons
    })
    await alert.present()
  }
}
