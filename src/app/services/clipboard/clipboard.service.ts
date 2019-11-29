import { Injectable } from '@angular/core'
import { Clipboard } from '@ionic-native/clipboard/ngx'
import { Platform, ToastController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(
    private readonly platform: Platform,
    private readonly clipboard: Clipboard,
    private readonly toastController: ToastController
  ) {}

  public async copy(text: string): Promise<void> {
    if (this.platform.is('cordova')) {
      return this.clipboard.copy(text)
    } else {
      return (navigator as any).clipboard.writeText(text)
    }
  }

  public async copyAndShowToast(text: string, toastMessage: string = 'Successfully copied to your clipboard!'): Promise<void> {
    try {
      await this.copy(text)
      await this.showToast(toastMessage)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  public async paste(): Promise<string> {
    try {
      if (this.platform.is('cordova')) {
        return this.clipboard.paste()
      } else {
        return (navigator as any).clipboard.readText()
      }
    } catch (err) {
      console.error('Failed to paste: ', err)
      throw err
    }
  }

  private async showToast(message: string) {
    const toast: HTMLIonToastElement = await this.toastController.create({
      message,
      duration: 1000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
