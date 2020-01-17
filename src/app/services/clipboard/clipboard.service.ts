import { Injectable } from '@angular/core'
import { Plugins } from '@capacitor/core'
import { ToastController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'

const { Clipboard } = Plugins

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(private readonly toastController: ToastController) {}

  public async copy(text: string): Promise<void> {
    return Clipboard.write({
      string: text
    })
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
      const text = await Clipboard.read({ 
        type: 'string'
      })
      return text.value
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
