import { handleErrorLocal, ErrorCategory } from './../error-handler/error-handler.service'
import { Injectable } from '@angular/core'
import { Platform, ToastController } from '@ionic/angular'
import { Clipboard } from '@ionic-native/clipboard'

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(
    private readonly platform: Platform,
    // private readonly clipboard: Clipboard,
    private readonly toastController: ToastController
  ) {}

  async copy(text: string): Promise<void> {
    if (this.platform.is('cordova')) {
      // TODO
      // return this.clipboard.copy(text)
    } else {
      return (navigator as any).clipboard.writeText(text)
    }
  }

  async copyAndShowToast(text: string, toastMessage: string = 'Successfully copied to your clipboard!') {
    try {
      await this.copy(text)
      await this.showToast(toastMessage)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  async paste(): Promise<string> {
    try {
      if (this.platform.is('cordova')) {
        // TODO
        // return this.clipboard.paste()
      } else {
        return (navigator as any).clipboard.readText()
      }
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  private async showToast(message: string) {
    let toast = this.toastController.create({
      message: message,
      duration: 1000,
      position: 'top',
      showCloseButton: true,
      closeButtonText: 'Ok'
    })
    // TODO
    // toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
