import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { AlertButton } from '@ionic/core'
import { TranslateService } from '@ngx-translate/core'
import { AirGapWallet, IACMessageDefinitionObject, IACMessageType, Serializer, UnsignedTransaction } from 'airgap-coin-lib'

import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'
import { to, parseIACUrl } from 'src/app/utils/utils'

enum IACResult {
  SUCCESS = 0,
  PARTIAL = 1,
  ERROR = 2
}

@Injectable({
  providedIn: 'root'
})
export class SchemeRoutingService {
  private readonly syncSchemeHandlers: {
    [key in IACMessageType]: (deserializedSync: IACMessageDefinitionObject, scanAgainCallback: Function) => Promise<boolean>
  }

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService
  ) {
    this.syncSchemeHandlers = {
      [IACMessageType.MetadataRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MetadataResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.AccountShareRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.AccountShareResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.TransactionSignRequest]: this.handleUnsignedTransaction.bind(this),
      [IACMessageType.TransactionSignResponse]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MessageSignRequest]: this.syncTypeNotSupportedAlert.bind(this),
      [IACMessageType.MessageSignResponse]: this.syncTypeNotSupportedAlert.bind(this)
    }
  }

  public async handleNewSyncRequest(
    data: string | string[],
    scanAgainCallback: Function = (scanResult: { currentPage: number; totalPageNumber: number }): void => {}
  ): Promise<IACResult> {
    // wait for secrets to be loaded for sure
    await this.secretsService.isReady()

    const serializer: Serializer = new Serializer()

    const toDecode: string[] = parseIACUrl(data, 'd')
    const [error, deserializedSync]: [Error, IACMessageDefinitionObject[]] = await to(serializer.deserialize(toDecode))

    if (error && !error.message) {
      scanAgainCallback(error)

      return IACResult.PARTIAL
    } else if (error && error.message) {
      console.warn('Deserialization of sync failed', error)
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

      return IACResult.ERROR
    }
    const firstMessage: IACMessageDefinitionObject = deserializedSync[0]

    if (firstMessage.type in IACMessageType) {
      this.syncSchemeHandlers[firstMessage.type](firstMessage, scanAgainCallback).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))

      return IACResult.SUCCESS
    } else {
      this.syncTypeNotSupportedAlert(firstMessage, scanAgainCallback).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))

      return IACResult.ERROR
    }
  }

  private async handleUnsignedTransaction(deserializedSyncProtocol: IACMessageDefinitionObject, scanAgainCallback: Function) {
    const unsignedTransaction: UnsignedTransaction = deserializedSyncProtocol.payload as UnsignedTransaction

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

  private async syncTypeNotSupportedAlert(_deserializedSyncProtocol: IACMessageDefinitionObject, scanAgainCallback: Function) {
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
      const alert = await this.alertController.create({
        header: values[title],
        message: values[message],
        backdropDismiss: true,
        buttons: buttons.map(button => (button.text = values[button.text]))
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }
}
