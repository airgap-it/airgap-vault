import { assertNever, UIAction, UIActionStatus, UiEventService, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { IAirGapTransaction, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, OnDestroy } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { AlertOptions, ModalOptions, OverlayEventDetail } from '@ionic/core'
import { Store } from '@ngrx/store'
import { Observable, Subscription } from 'rxjs'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SelectAccountPage } from '../select-account/select-account.page'

import * as actions from './deserialized-detail.actions'
import * as fromDeserializedDetail from './deserialized-detail.reducer'
import { Alert, Modal, Mode, UnsignedMessage } from './deserialized.detail.types'

type ModalOnDismissAction = (modalData: OverlayEventDetail<unknown>) => Promise<void>

@Component({
  selector: 'airgap-deserialized-detail',
  templateUrl: './deserialized-detail.page.html',
  styleUrls: ['./deserialized-detail.page.scss']
})
export class DeserializedDetailPage implements OnDestroy {
  public readonly mode$: Observable<Mode | undefined>
  public readonly title$: Observable<string>
  public readonly button$: Observable<string | undefined>

  public readonly transactionsDetails$: Observable<UIResource<IAirGapTransaction[]>>
  public readonly messages$: Observable<UIResource<UnsignedMessage[]>>
  public readonly rawData$: Observable<UIResource<string>>

  public readonly alert$: Observable<UIAction<Alert> | undefined>
  public readonly modal$: Observable<UIAction<Modal> | undefined>

  public readonly Mode: typeof Mode = Mode
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  private alertElement: HTMLIonAlertElement
  private modalElement: HTMLIonModalElement

  private subscriptions: Subscription[] = []

  constructor(
    private readonly store: Store<fromDeserializedDetail.State>,
    private readonly uiEventService: UiEventService,
    private readonly modalController: ModalController
  ) {
    this.mode$ = this.store.select(fromDeserializedDetail.selectMode)
    this.title$ = this.store.select(fromDeserializedDetail.selectTitle)
    this.button$ = this.store.select(fromDeserializedDetail.selectButton)
    this.alert$ = this.store.select(fromDeserializedDetail.selectAlert)
    this.modal$ = this.store.select(fromDeserializedDetail.selectModal)

    this.transactionsDetails$ = this.store.select(fromDeserializedDetail.selectTransactionsDetails)
    this.messages$ = this.store.select(fromDeserializedDetail.selectMessagesData)

    this.rawData$ = this.store.select(fromDeserializedDetail.selectRaw)

    this.subscriptions.push(this.alert$.subscribe(this.dismissOrShowAlert.bind(this)))
    this.subscriptions.push(this.modal$.subscribe(this.dismissOrShowModal.bind(this)))

    this.store.dispatch(actions.viewInitialization())
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe()
    })
    this.subscriptions = []
  }

  public continue(): void {
    this.store.dispatch(actions.approved())
  }

  private async dismissOrShowAlert(alert: UIAction<Alert> | undefined): Promise<void> {
    this.alertElement?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    if (alert?.status === UIActionStatus.PENDING) {
      this.alertElement = await this.uiEventService.getTranslatedAlert(this.getAlertData(alert.value))
      this.alertElement.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))

      return this.alertElement
        .onWillDismiss()
        .then(() => {
          this.store.dispatch(actions.alertDismissed({ id: alert.id }))
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    } else {
      this.alertElement = undefined
    }
  }

  private async dismissOrShowModal(modal: UIAction<Modal> | undefined): Promise<void> {
    this.modalElement?.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    if (modal?.status === UIActionStatus.PENDING) {
      const [modalOptions, onDismissAction]: [ModalOptions, ModalOnDismissAction] = this.getModalData(modal.value)
      this.modalElement = await this.modalController.create(modalOptions)
      this.modalElement.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      return this.modalElement
        .onWillDismiss()
        .then(
          (data: OverlayEventDetail<unknown>): Promise<void> => {
            this.store.dispatch(actions.modalDismissed({ id: modal.id }))

            return onDismissAction(data)
          }
        )
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    } else {
      this.modalElement = undefined
    }
  }

  private getAlertData(alert: Alert): AlertOptions {
    switch (alert.type) {
      case 'bip39Passphrase':
        return this.bip39PassphraseAlert()
      case 'bip39PassphraseError':
        return this.bip39PassphraseErrorAlert()
      case 'secretNotFound':
        return this.secretNotFoundErrorAlert()
      case 'unknownError':
        return this.unknownErrorAlert(alert.message)
      default:
        return {}
    }
  }

  private bip39PassphraseAlert(): AlertOptions {
    return {
      header: 'deserialized-detail.alert.bip39-passphrase.header',
      message: 'deserialized-detail.alert.bip39-passphrase.message',
      backdropDismiss: false,
      inputs: [
        {
          name: 'bip39Passphrase',
          type: 'password',
          placeholder: 'deserialized-detail.alert.bip39-passphrase.input-placeholder_label'
        }
      ],
      buttons: [
        {
          text: 'deserialized-detail.alert.bip39-passphrase.button_label',
          handler: async (result: { bip39Passphrase: string }): Promise<void> => {
            const passphrase: string = result.bip39Passphrase ?? ''
            this.store.dispatch(actions.bip39PassphraseProvided({ passphrase }))
          }
        }
      ]
    }
  }

  private bip39PassphraseErrorAlert(): AlertOptions {
    return {
      header: 'deserialized-detail.alert.bip39-passphrase-error.header',
      message: 'deserialized-detail.alert.bip39-passphrase-error.message',
      backdropDismiss: false,
      buttons: [
        {
          text: 'deserialized-detail.alert.bip39-passphrase-error.button_label'
        }
      ]
    }
  }

  private secretNotFoundErrorAlert(): AlertOptions {
    return {
      header: 'deserialized-detail.alert.secret-not-found-error.header',
      message: 'deserialized-detail.alert.secret-not-found-error.message',
      backdropDismiss: false,
      buttons: [
        {
          text: 'deserialized-detail.alert.secret-not-found-error.button_label'
        }
      ]
    }
  }

  private unknownErrorAlert(message?: string): AlertOptions {
    return {
      header: 'deserialized-detail.alert.unknown-error.header',
      message: message ?? 'deserialized-detail.alert.unknown-error.message',
      backdropDismiss: true,
      buttons: [
        {
          text: 'deserialized-detail.alert.unknown-error.button_label'
        }
      ]
    }
  }

  private getModalData(modal: Modal): [ModalOptions, ModalOnDismissAction] {
    switch (modal) {
      case 'selectSigningAccount':
        return this.selectSigningAccountModal()
      default:
        assertNever('getModalForType', modal)
    }
  }

  private selectSigningAccountModal(): [ModalOptions, ModalOnDismissAction] {
    const options: ModalOptions = {
      component: SelectAccountPage,
      componentProps: { type: 'message-signing' }
    }

    const action: ModalOnDismissAction = async (modalData: OverlayEventDetail<unknown>): Promise<void> => {
      if (modalData.data === undefined || typeof modalData.data !== 'string') {
        return
      }

      this.store.dispatch(actions.signingProtocolProvided({ protocol: modalData.data as ProtocolSymbols }))
    }

    return [options, action]
  }
}
