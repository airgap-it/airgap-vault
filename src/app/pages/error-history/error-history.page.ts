import { ClipboardService } from '@airgap/angular-core'
import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { ErrorCategory, handleErrorLocal, LocalErrorLogger } from 'src/app/services/error-handler/error-handler.service'

interface ErrorObject {
  date: number
  title: string
  detail: string
  expanded: boolean
}

@Component({
  selector: 'airgap-error-history',
  templateUrl: './error-history.page.html',
  styleUrls: ['./error-history.page.scss']
})
export class ErrorHistoryPage implements OnInit {
  public errorHistory: ErrorObject[] = []

  constructor(private readonly alertController: AlertController, private readonly clipboardService: ClipboardService) {}

  async ngOnInit() {
    this.updateList()
  }

  async updateList() {
    const logger = new LocalErrorLogger()
    this.errorHistory = await (
      await logger.getErrorHistory()
    ).map((error) => ({
      date: error[4],
      title: error[2] ? error[2].split('\n')[0] : '',
      detail: error[2],
      expanded: false
    }))
  }

  public async copyErrorHistory(): Promise<void> {
    if (this.errorHistory.length > 0) {
      const alert: HTMLIonAlertElement = await this.alertController.create({
        header: 'Copy Error History',
        subHeader: 'WARNING',
        message:
          '<b>It is possible that the error history contains your private keys, so you should ONLY use this feature if you are testing your device without any funds on it.</b><br /><br />If you encounter an error while using AirGap Vault, sending the developers your local error history could help them pinpoint the problem.<br /><br />Send this error history <b>only</b> to hi@airgap.it, along with a detailed description of your problem.',
        inputs: [
          {
            name: 'understood',
            type: 'checkbox',
            label: 'I understand',
            value: 'understood',
            checked: false
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Copy',
            handler: async (result: string[]) => {
              if (result.includes('understood')) {
                const errorHistory = await new LocalErrorLogger().getErrorHistoryFormatted()
                this.clipboardService.copyAndShowToast(errorHistory, 'Local error history copied to clipboard')
              }
            }
          }
        ]
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    } else {
      return this.noErrors()
    }
  }

  async noErrors() {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'No errors',
      message: `No recent errors occured, we can't copy anything to your clipboard.`,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  async clearErrors() {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Clear errors',
      message: `Do you want to clear your error history?`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            const logger = new LocalErrorLogger()
            logger.clearAll()
          }
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))

    alert.onDidDismiss().then(() => {
      this.updateList()
    })
  }
}
