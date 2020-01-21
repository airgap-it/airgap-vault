import { Injectable, NgZone } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'
import { ComponentRef, ModalOptions } from '@ionic/core'
import { Plugins, PluginListenerHandle } from '@capacitor/core'

import { Warning, WarningModalPage } from '../../pages/warning-modal/warning-modal.page'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'

const { SecurityUtils } = Plugins

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private screenCaptureStateChangedListeners: PluginListenerHandle[] = []
  private screenshotTakenListeners: PluginListenerHandle[] = []

  constructor(
    private readonly ngZone: NgZone,
    private readonly platform: Platform,
    private readonly modalController: ModalController,
    protected readonly navigationService: NavigationService
  ) {}

  public enableScreenshotProtection(): void {
    this.setSecureWindow()
    this.onScreenCaptureStateChanged((captured: boolean) => {
      if (captured) {
        this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
          this.navigationService.routeBack('/secret-create')
        }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
      }
    })
    this.onScreenshotTaken(() => {
      this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
        this.navigationService.routeBack('/secret-create')
      }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
    })
  }

  public disableScreenshotProtection(): void {
    this.clearSecureWindow()
    this.removeScreenCaptureObservers()
    this.removeScreenshotObservers()
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

  public async checkForRoot(): Promise<boolean> {
    if (this.platform.is('hybrid')) {
      const result = await SecurityUtils.assessDeviceIntegrity()
      return !result.value
    } else {
      console.warn('root detection skipped - no supported platform')
      return false
    }
  }

  public onScreenCaptureStateChanged(callback: (captured: boolean) => void): void {
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      const listener = SecurityUtils.addListener('screenCaptureStateChanged', event => {
        this.ngZone.run(() => {
          callback(event.captured)
        })
      })
      this.screenCaptureStateChangedListeners.push(listener)
    }
  }

  public setSecureWindow(): void {
    if (this.platform.is('android') && this.platform.is('hybrid')) {
      SecurityUtils.setWindowSecureFlag()
    }
  }

  public clearSecureWindow(): void {
    if (this.platform.is('android') && this.platform.is('hybrid')) {
      SecurityUtils.clearWindowSecureFlag()
    }
  }

  public removeScreenCaptureObservers(): void {
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      this.removeListeners(this.screenCaptureStateChangedListeners)
      this.screenCaptureStateChangedListeners = []
    }
  }

  public onScreenshotTaken(callback: () => void): void {
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      const listener = SecurityUtils.addListener('screenshotTaken', () => {
        this.ngZone.run(() => {
          callback()
        })
      })
      this.screenCaptureStateChangedListeners.push(listener)
    }
  }

  public removeScreenshotObservers(): void {
    if (this.platform.is('ios') && this.platform.is('hybrid')) {
      this.removeListeners(this.screenshotTakenListeners)
      this.screenshotTakenListeners = []
    }
  }

  public async checkForElectron(): Promise<boolean> {
    return typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0
  }

  private removeListeners(listeners: PluginListenerHandle[]) {
    listeners.forEach(listener => { listener.remove() })
  }
}
