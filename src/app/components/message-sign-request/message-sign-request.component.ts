import { SelectAccountPage } from './../../pages/select-account/select-account.page'
import { Component, Input } from '@angular/core'
import { IACMessageDefinitionObject, MessageSignRequest, MessageSignResponse, ICoinProtocol } from 'airgap-coin-lib'
import { InteractionService, InteractionOperationType } from 'src/app/services/interaction/interaction.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import * as bip39 from 'bip39'
import { Secret } from 'src/app/models/secret'
import { AlertController, ModalController } from '@ionic/angular'
import { ProtocolService } from '@airgap/angular-core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-message-sign-request',
  templateUrl: './message-sign-request.component.html',
  styleUrls: ['./message-sign-request.component.scss']
})
export class MessageSignRequestComponent {
  @Input()
  public messageObject: IACMessageDefinitionObject

  @Input()
  public syncProtocolString: string

  constructor(
    private readonly interactionService: InteractionService,
    private readonly navigationService: NavigationService,
    private readonly protocolService: ProtocolService,
    private readonly secretsService: SecretsService,
    private readonly alertCtrl: AlertController,
    private readonly modalController: ModalController
  ) { }

  public async signAndGoToNextPage(): Promise<void> {
    console.log('MessageSignRequestComponent', this.messageObject)
    try {
      const protocol = await this.getSigningProtocol()
      if (!protocol) {
        this.navigationService.route('')
        return
      }
      const message = (this.messageObject.payload as MessageSignRequest).message
      const secret: Secret = this.secretsService.getActiveSecret()

      // we should handle this case here as well
      if (!secret) {
        console.warn('no secret found for this public key')
        throw new Error('no secret found for this public key')
      }

      const entropy = await this.secretsService.retrieveEntropyForSecret(secret)

      const mnemonic: string = bip39.entropyToMnemonic(entropy)
      const privateKey: Buffer = await protocol.getPrivateKeyFromMnemonic(mnemonic, protocol.standardDerivationPath) // TODO

      const signature = await protocol.signMessage(message, { privateKey })
      const messageSignRequest = this.messageObject.payload as MessageSignRequest
      const messageSignResponse: MessageSignResponse = {
        message: messageSignRequest.message,
        publicKey: messageSignRequest.publicKey,
        signature: signature
      }

      this.interactionService.startInteraction(
        {
          operationType: InteractionOperationType.MESSAGE_SIGN_REQUEST,
          url: signature,
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

  public async getSigningProtocol(): Promise<ICoinProtocol> {
    let protocol
    if (!this.messageObject.protocol || this.messageObject.protocol.length === 0) {
      const modal: HTMLIonModalElement = await this.modalController.create({
        component: SelectAccountPage,
        componentProps: { type: 'message-signing' }
      })
      modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      await modal
        .onDidDismiss()
        .then((modalData) => {
          console.log()
          if (!modalData.data) {
            return
          }
          const identifier = modalData.data
          protocol = this.protocolService.getProtocol(identifier)
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    } else {
      protocol = this.protocolService.getProtocol(this.messageObject.protocol)
    }
    return protocol
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
