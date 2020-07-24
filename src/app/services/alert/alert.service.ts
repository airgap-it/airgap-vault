import { AlertButton } from '@ionic/core'
import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private readonly alertCtrl: AlertController, private readonly translateService: TranslateService) {}

  public async showTranslatedAlert(
    title: string,
    message: string,
    backdropDismiss: boolean,
    buttons: AlertButton[],
    _subHeader?: string
  ): Promise<void> {
    return new Promise((reject) => {
      const translationKeys = [title, message, ...buttons.map((button) => button.text), _subHeader].filter((key) => key !== undefined)
      this.translateService.get(translationKeys).subscribe(async (values) => {
        const translatedButtons = buttons.map((button) => {
          button.text = values[button.text]
          return button
        })

        const alert = await this.alertCtrl.create({
          header: values[title],
          subHeader: values[_subHeader],
          message: values[message],
          backdropDismiss: backdropDismiss,
          buttons: translatedButtons
        })

        alert.present().catch(() => {
          reject()
          handleErrorLocal(ErrorCategory.IONIC_ALERT)
        })
      })
    })
  }
}
