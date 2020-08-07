import { Injectable, Inject } from '@angular/core'
import { ClipboardPlugin } from '@capacitor/core'
import { ToastController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'
import { CLIPBOARD_PLUGIN } from '../../capacitor-plugins/injection-tokens'

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(private readonly toastController: ToastController, @Inject(CLIPBOARD_PLUGIN) private readonly clipboard: ClipboardPlugin) {}

  public async copy(text: string): Promise<void> {
    return this.clipboard.write({
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
      const text = await this.clipboard.read()
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
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    })
    toast.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
