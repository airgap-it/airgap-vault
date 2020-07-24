import { AlertButton } from '@ionic/core'
import { Injectable } from '@angular/core'
import { AlertController, ToastController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler.service'
import { TranslateService } from '@ngx-translate/core'
import { Diagnostic } from '@ionic-native/diagnostic/ngx'
import { ClipboardService } from '../clipboard/clipboard.service'
import { first } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(
    private readonly alertCtrl: AlertController,
    private readonly toastCtrl: ToastController,
    private readonly clipboardService: ClipboardService,
    private readonly translateService: TranslateService,
    private readonly diagnostic: Diagnostic
  ) {}

  // secret.service.ts
  // transaction-detail.page.ts
  public async showErrorAlert(title: string, message: string): Promise<void> {
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

  // secret-show.page.ts
  public async showConfirmOnlyAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['Okay']
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  // deep-link.service.ts
  public showAppNotFoundAlert(): void {
    this.translateService
      .get(['deep-link.app-not-found.title', 'deep-link.app-not-found.message', 'deep-link.app-not-found.ok'], {
        otherAppName: 'AirGap Wallet'
      })
      .subscribe(async (translated: string[]) => {
        const alert: HTMLIonAlertElement = await this.alertCtrl.create({
          header: translated['deep-link.app-not-found.title'],
          message: translated['deep-link.app-not-found.message'],
          backdropDismiss: false,
          buttons: [
            {
              text: translated['deep-link.app-not-found.ok'],
              role: 'cancel'
            }
          ]
        })
        alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      })
  }

  // scheme-routing.service.ts
  public showTranslatedAlert(title: string, message: string, buttons: AlertButton[]): void {
    const translationKeys = [title, message, ...buttons.map((button) => button.text)]
    this.translateService.get(translationKeys).subscribe(async (values) => {
      const translatedButtons = buttons.map((button) => {
        button.text = values[button.text]
        return button
      })

      const alert = await this.alertCtrl.create({
        header: values[title],
        message: values[message],
        backdropDismiss: true,
        buttons: translatedButtons
      })

      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    })
  }

  // permissions.service.ts
  public async showPermissionsAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: title,
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Open settings',
          handler: () => {
            this.diagnostic.switchToSettings().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
          }
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  // secret-edit.page.ts
  public async showToast(message: string) {
    const toast: HTMLIonToastElement = await this.toastCtrl.create({
      message: this.translateService.instant(message),
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

  // secret-edit.page.ts
  public async showRecoveryKeyAlert(recoveryKey: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: this.translateService.instant('secret-edit.secret-recovery-key.alert.title'),
      subHeader: this.translateService.instant('secret-edit.secret-recovery-key.description'),
      message: recoveryKey,
      buttons: [
        {
          text: this.translateService.instant('secret-edit.secret-recovery-key.alert.copy'),
          handler: () => {
            this.clipboardService.copy(recoveryKey)
            this.showToast('secret-edit.secret-recovery-key.copied')
          }
        },
        {
          text: this.translateService.instant('secret-edit.secret-recovery-key.alert.done'),
          handler: () => {}
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  public async deleteAccountAlert(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.translateService
        .get([
          'wallet-edit-delete-popover.account-removal_alert.title',
          'wallet-edit-delete-popover.account-removal_alert.text',
          'wallet-edit-delete-popover.account-removal_alert.cancel_label',
          'wallet-edit-delete-popover.account-removal_alert.delete_label'
        ])
        .pipe(first())
        .subscribe(async (values: string[]) => {
          const title: string = values['wallet-edit-delete-popover.account-removal_alert.title']
          const message: string = values['wallet-edit-delete-popover.account-removal_alert.text']
          const cancelButton: string = values['wallet-edit-delete-popover.account-removal_alert.cancel_label']
          const deleteButton: string = values['wallet-edit-delete-popover.account-removal_alert.delete_label']

          const alert: HTMLIonAlertElement = await this.alertCtrl.create({
            header: title,
            message,
            buttons: [
              {
                text: cancelButton,
                role: 'cancel',
                handler: (): void => {
                  reject()
                }
              },
              {
                text: deleteButton,
                handler: (): void => {
                  resolve()
                }
              }
            ]
          })
          alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
        })
    })
  }

  public async deleteServiceAlert(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.translateService
        .get([
          'secret-edit-delete-popover.title',
          'secret-edit-delete-popover.text',
          'secret-edit-delete-popover.cancel_label',
          'secret-edit-delete-popover.delete_label'
        ])
        .pipe(first())
        .subscribe(async (values: string[]) => {
          const title: string = values['secret-edit-delete-popover.title']
          const message: string = values['secret-edit-delete-popover.text']
          const cancelButton: string = values['secret-edit-delete-popover.cancel_label']
          const deleteButton: string = values['secret-edit-delete-popover.delete_label']

          const alert: HTMLIonAlertElement = await this.alertCtrl.create({
            header: title,
            message,
            buttons: [
              {
                text: cancelButton,
                role: 'cancel',
                handler: (): void => {
                  reject()
                }
              },
              {
                text: deleteButton,
                handler: (): void => {
                  resolve()
                }
              }
            ]
          })
          alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
        })
    })
  }
}
