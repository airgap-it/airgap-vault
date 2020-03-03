import { Injectable, NgZone } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'
import { ComponentRef, ModalOptions } from '@ionic/core'

import { Warning, WarningModalPage } from '../../pages/warning-modal/warning-modal.page'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'

declare var SecurityUtils: any

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(
    private readonly ngZone: NgZone,
    private readonly platform: Platform,
    private readonly modalController: ModalController,
    protected readonly navigationService: NavigationService
  ) {}

  public enableScreenshotProtection(options?: { routeBack: string }): void {
    this.setSecureWindow()
    this.onScreenCaptureStateChanged((captured: boolean) => {
      if (captured) {
        this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
          options ? this.navigationService.routeBack(options.routeBack) : this.navigationService.back()
        }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
      }
    })
    this.onScreenshotTaken(() => {
      this.presentModal(WarningModalPage, { errorType: Warning.SCREENSHOT }, () => {
        options ? this.navigationService.routeBack(options.routeBack) : this.navigationService.back()
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

  public checkForRoot(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.platform.is('cordova')) {
        SecurityUtils.DeviceIntegrity.assess(result => {
          resolve(!result)
        })
      } else {
        console.warn('root detection skipped - no supported platform')
        resolve(false)
      }
    })
  }

  public onScreenCaptureStateChanged(callback: (captured: boolean) => void): void {
    if (this.platform.is('ios') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.onScreenCaptureStateChanged((captured: boolean) => {
        this.ngZone.run(() => {
          callback(captured)
        })
      })
    }
  }

  public setSecureWindow(): void {
    if (this.platform.is('android') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.setWindowSecureFlag()
    }
  }

  public clearSecureWindow(): void {
    if (this.platform.is('android') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.clearWindowSecureFlag()
    }
  }

  public removeScreenCaptureObservers(): void {
    if (this.platform.is('ios') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.removeScreenCaptureObservers()
    }
  }

  public onScreenshotTaken(callback: () => void): void {
    if (this.platform.is('ios') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.onScreenshotTaken(() => {
        this.ngZone.run(() => {
          callback()
        })
      })
    }
  }

  public removeScreenshotObservers(): void {
    if (this.platform.is('ios') && this.platform.is('cordova')) {
      SecurityUtils.SecureScreen.removeScreenshotObservers()
    }
  }

  public async checkForElectron(): Promise<boolean> {
    return typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0
  }
}
