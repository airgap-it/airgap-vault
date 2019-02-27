import { Injectable } from '@angular/core'
import { AlertController, AlertButton, App, NavController } from 'ionic-angular'
import { AirGapWallet, DeserializedSyncProtocol, UnsignedTransaction, SyncProtocolUtils, EncodedType } from 'airgap-coin-lib'
import { SecretsProvider } from '../secrets/secrets.provider'
import { TransactionDetailPage } from '../../pages/transaction-detail/transaction-detail'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler'
import { TranslateService } from '@ngx-translate/core'

@Injectable()
export class SchemeRoutingProvider {
  private navController: NavController
  /* TS 2.7 feature
  private syncSchemeHandlers: {
    [key in EncodedType]: (deserializedSync: DeserializedSyncProtocol, scanAgainCallback: Function) => Promise<boolean>
  }
  */
  private syncSchemeHandlers: ((deserializedSync: DeserializedSyncProtocol, scanAgainCallback: Function) => Promise<boolean>)[] = []

  constructor(
    protected app: App,
    private secretsProvider: SecretsProvider,
    private alertCtrl: AlertController,
    private translateService: TranslateService
  ) {
    this.syncSchemeHandlers[EncodedType.WALLET_SYNC] = this.syncTypeNotSupportedAlert.bind(this)
    this.syncSchemeHandlers[EncodedType.UNSIGNED_TRANSACTION] = this.handleUnsignedTransaction.bind(this)
    this.syncSchemeHandlers[EncodedType.SIGNED_TRANSACTION] = this.syncTypeNotSupportedAlert.bind(this)

    /* TS 2.7 feature
    this.syncSchemeHandlers = {
      [EncodedType.WALLET_SYNC]: this.syncTypeNotSupportedAlert.bind(this),
      [EncodedType.UNSIGNED_TRANSACTION]: this.handleUnsignedTransaction.bind(this),
      [EncodedType.SIGNED_TRANSACTION]: this.syncTypeNotSupportedAlert.bind(this)
    }
    */
  }

  async handleNewSyncRequest(
    navCtrl: NavController,
    rawString: string,
    scanAgainCallback: Function = () => {
      /* */
    }
  ) {
    // wait for secrets to be loaded for sure
    await this.secretsProvider.isReady()

    this.navController = navCtrl
    const syncProtocol = new SyncProtocolUtils()

    let data: string | undefined
    try {
      let url: URL = new URL(rawString)
      data = url.searchParams.get('d')
    } catch (e) {
      data = rawString // Fallback to support raw data QRs
    }

    try {
      const deserializedSync = await syncProtocol.deserialize(data)

      if (deserializedSync.type in EncodedType) {
        // Only handle types that we know
        return this.syncSchemeHandlers[deserializedSync.type](deserializedSync, scanAgainCallback)
      } else {
        return this.syncTypeNotSupportedAlert(deserializedSync, scanAgainCallback)
      }
    } catch (e) {
      console.warn('Deserialization of sync failed', e)
      // TODO: Log error locally
      const cancelButton = {
        text: 'tab-wallets.invalid-sync-operation_alert.okay_label',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }
      this.showTranslatedAlert('tab-wallets.invalid-sync-operation_alert.title', 'tab-wallets.invalid-sync-operation_alert.text', [
        cancelButton
      ])
    }
  }

  private async handleUnsignedTransaction(deserializedSyncProtocol: DeserializedSyncProtocol, scanAgainCallback: Function) {
    const unsignedTransaction = deserializedSyncProtocol.payload as UnsignedTransaction

    let correctWallet = this.secretsProvider.findWalletByPublicKeyAndProtocolIdentifier(
      unsignedTransaction.publicKey,
      deserializedSyncProtocol.protocol
    )

    // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
    // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
    // and fee for all tokens we support.
    if (!correctWallet) {
      const baseWallet = this.secretsProvider.findBaseWalletByPublicKeyAndProtocolIdentifier(
        unsignedTransaction.publicKey,
        deserializedSyncProtocol.protocol
      )

      // If the protocol is not supported, use the base protocol for signing
      try {
        correctWallet = new AirGapWallet(
          deserializedSyncProtocol.protocol,
          baseWallet.publicKey,
          baseWallet.isExtendedPublicKey,
          baseWallet.derivationPath
        )
        correctWallet.addresses = baseWallet.addresses
      } catch (e) {
        if (e.message === 'PROTOCOL_NOT_SUPPORTED') {
          correctWallet = baseWallet
        }
      }
    }

    if (correctWallet) {
      if (this.navController) {
        this.navController
          .push(TransactionDetailPage, {
            transaction: unsignedTransaction,
            wallet: correctWallet
          })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    } else {
      const cancelButton = {
        text: 'tab-wallets.no-secret_alert.okay_label',
        role: 'cancel',
        handler: () => {
          scanAgainCallback()
        }
      }

      this.showTranslatedAlert('tab-wallets.no-secret_alert.title', 'tab-wallets.no-secret_alert.text', [cancelButton])
    }
  }

  private async syncTypeNotSupportedAlert(_deserializedSyncProtocol: DeserializedSyncProtocol, scanAgainCallback: Function) {
    // TODO: Log error locally
    const cancelButton = {
      text: 'tab-wallets.sync-operation-not-supported_alert.okay_label',
      role: 'cancel',
      handler: () => {
        scanAgainCallback()
      }
    }
    this.showTranslatedAlert(
      'tab-wallets.sync-operation-not-supported_alert.title',
      'tab-wallets.sync-operation-not-supported_alert.text',
      [cancelButton]
    )
  }

  showTranslatedAlert(title: string, message: string, buttons: AlertButton[]): void {
    const translationKeys = [title, message, ...buttons.map(button => button.text)]
    this.translateService.get(translationKeys).subscribe(values => {
      let alert = this.alertCtrl.create({
        title: values[title],
        message: values[message],
        enableBackdropDismiss: true,
        buttons: buttons.map(button => (button.text = values[button.text]))
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }
}
