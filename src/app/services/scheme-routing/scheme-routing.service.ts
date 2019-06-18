import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { AlertButton } from '@ionic/core'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, UnsignedTransaction } from 'airgap-coin-lib'

import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class SchemeRoutingService {
  private readonly syncSchemeHandlers: {
    [key in EncodedType]: (deserializedSync: DeserializedSyncProtocol, scanAgainCallback: Function) => Promise<boolean>
  }

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService
  ) {
    this.syncSchemeHandlers = {
      [EncodedType.WALLET_SYNC]: this.syncTypeNotSupportedAlert.bind(this),
      [EncodedType.UNSIGNED_TRANSACTION]: this.handleUnsignedTransaction.bind(this),
      [EncodedType.SIGNED_TRANSACTION]: this.syncTypeNotSupportedAlert.bind(this)
    }
  }

  public async handleNewSyncRequest(rawString: string, scanAgainCallback: () => void = () => {}): Promise<boolean | void> {
    // wait for secrets to be loaded for sure
    await this.secretsService.isReady()

    const syncProtocol: SyncProtocolUtils = new SyncProtocolUtils()

    let data: string | undefined
    try {
      const url: URL = new URL(rawString)
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
    // tslint:disable:no-unnecessary-type-assertion
    const unsignedTransaction = deserializedSyncProtocol.payload as UnsignedTransaction
    // tslint:enable:no-unnecessary-type-assertion

    let correctWallet = this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(
      unsignedTransaction.publicKey,
      deserializedSyncProtocol.protocol
    )

    // If we can't find a wallet for a protocol, we will try to find the "base" wallet and then create a new
    // wallet with the right protocol. This way we can sign all ERC20 transactions, but show the right amount
    // and fee for all tokens we support.
    if (!correctWallet) {
      const baseWallet = this.secretsService.findBaseWalletByPublicKeyAndProtocolIdentifier(
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
      this.navigationService
        .routeWithState('transaction-detail', {
          transaction: unsignedTransaction,
          wallet: correctWallet,
          deserializedSync: deserializedSyncProtocol
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
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

  public showTranslatedAlert(title: string, message: string, buttons: AlertButton[]): void {
    const translationKeys = [title, message, ...buttons.map(button => button.text)]
    this.translateService.get(translationKeys).subscribe(async values => {
      const alert = await this.alertCtrl.create({
        header: values[title],
        message: values[message],
        backdropDismiss: true,
        buttons: buttons.map(button => (button.text = values[button.text]))
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }
}
