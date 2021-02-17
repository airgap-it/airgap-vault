import { SelectAccountPage } from './../../pages/select-account/select-account.page'
import { Component, Input } from '@angular/core'
import {
  IACMessageDefinitionObject,
  MessageSignRequest,
  MessageSignResponse,
  IACMessageType,
  ProtocolSymbols,
  MainProtocolSymbols,
  TezosCryptoClient,
  AirGapWallet
} from '@airgap/coinlib-core'
import { InteractionService, InteractionOperationType } from 'src/app/services/interaction/interaction.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import * as bip39 from 'bip39'
import { Secret } from 'src/app/models/secret'
import { AlertController, ModalController } from '@ionic/angular'
import { SerializerService } from '@airgap/angular-core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-message-sign-request',
  templateUrl: './message-sign-request.component.html',
  styleUrls: ['./message-sign-request.component.scss']
})
export class MessageSignRequestComponent {
  @Input()
  public messageDefinitionObject: IACMessageDefinitionObject

  public message: string
  public blake2bHash: string | undefined

  @Input()
  public syncProtocolString: string

  constructor(
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly serializerService: SerializerService,
    private readonly alertCtrl: AlertController,
    private readonly modalController: ModalController
  ) {}

  public async ngOnInit() {
    this.message = (this.messageDefinitionObject.payload as MessageSignRequest).message

    if (this.messageDefinitionObject.protocol === MainProtocolSymbols.XTZ) {
      const cryptoClient = new TezosCryptoClient()
      this.blake2bHash = await cryptoClient.blake2bLedgerHash(this.message)
    }
  }

  public async signAndGoToNextPage(): Promise<void> {
    try {
      const { account, secret } = await this.getSigningData()

      if (!account) {
        this.navigationService.route('')
        return
      }

      const entropy = await this.secretsService.retrieveEntropyForSecret(secret)

      const mnemonic: string = bip39.entropyToMnemonic(entropy)
      const privateKey: Buffer = await account.protocol.getPrivateKeyFromMnemonic(mnemonic, account.derivationPath) // TODO

      const signature = await account.protocol.signMessage(this.message, { privateKey })
      const messageSignRequest = this.messageDefinitionObject.payload as MessageSignRequest
      const messageSignResponse: MessageSignResponse = {
        message: messageSignRequest.message,
        publicKey: messageSignRequest.publicKey,
        signature: signature
      }

      const messageDefinitionObject = {
        id: this.messageDefinitionObject.id,
        type: IACMessageType.MessageSignResponse,
        protocol: account.protocol.identifier as ProtocolSymbols,
        payload: messageSignResponse
      }

      const serializedMessage: string[] = await this.serializerService.serialize([messageDefinitionObject])
      const broadcastUrl = `airgap-wallet://?d=${serializedMessage.join(',')}`
      this.interactionService.startInteraction(
        {
          operationType: InteractionOperationType.MESSAGE_SIGN_REQUEST,
          url: broadcastUrl,
          messageSignResponse: messageSignResponse
        },
        this.secretsService.getActiveSecret()
      )
    } catch (error) {
      console.log('Caught error: ', error)
      if (error.message) {
        this.showAlert('Error', error.message)
      }
    }
  }

  public async getSigningData(): Promise<{ account: AirGapWallet; secret: Secret }> {
    let pubKey = (this.messageDefinitionObject.payload as MessageSignRequest).publicKey
    let account: AirGapWallet
    let secret: Secret
    if (!pubKey) {
      account = await this.selectSigningAccount()
      secret = this.secretsService.findByPublicKey(account.publicKey)
    } else {
      secret = this.secretsService.findByPublicKey(pubKey)
      if (!secret) {
        console.warn('no secret found for this public key')
        throw new Error('no secret found for this public key')
      }
      account = secret.wallets.find((wallet) => wallet.publicKey === pubKey)
    }

    return { account: account, secret: secret }
  }

  public async selectSigningAccount(): Promise<AirGapWallet> {
    return new Promise(async (resolve) => {
      const modal: HTMLIonModalElement = await this.modalController.create({
        component: SelectAccountPage,
        componentProps: { type: 'message-signing' }
      })
      modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      await modal
        .onDidDismiss()
        .then((modalData) => {
          resolve(modalData.data as AirGapWallet)
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    })
  }
  public async showAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
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
}
