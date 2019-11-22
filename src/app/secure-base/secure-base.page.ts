import { ModalController } from '@ionic/angular'
import { ComponentRef, ModalOptions } from '@ionic/core'

import { WarningModalPage } from '../pages/warning-modal/warning-modal.page'
import { DeviceService } from '../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../services/error-handler/error-handler.service'
import { NavigationService } from '../services/navigation/navigation.service'

export class SecureBasePage {
  constructor(
    protected readonly navigationService: NavigationService,
    private readonly deviceProvider: DeviceService,
    private readonly modalController: ModalController
  ) {}

  public ionViewDidEnter(): void {
    this.deviceProvider.setSecureWindow()
    this.deviceProvider.onScreenCaptureStateChanged((captured: boolean) => {
      if (captured) {
        this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
          this.navigationService.routeBack('/secret-create')
        }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
      }
    })
    this.deviceProvider.onScreenshotTaken(() => {
      this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
        this.navigationService.routeBack('/secret-create')
      }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
    })
  }

  public ionViewWillLeave(): void {
    this.deviceProvider.clearSecureWindow()
    this.deviceProvider.removeScreenCaptureObservers()
    this.deviceProvider.removeScreenshotObservers()
  }

  private async presentModal(page: ComponentRef, properties: ModalOptions['componentProps'], callback: Function): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: page,
      componentProps: properties,
      backdropDismiss: false
    })

    modal
      .onDidDismiss()
      .then(() => {
        callback()
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

    modal
      .present()
      .then(() => {
        console.log('check modal presented')
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }
}
