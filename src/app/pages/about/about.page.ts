import { Component, Inject } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { APP_INFO_PLUGIN, AppInfoPlugin } from '@airgap/angular-core'
import { InstallationType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { AlertController, Platform } from '@ionic/angular'

@Component({
  selector: 'airgap-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss']
})
export class AboutPage {
  public appName: string = 'APP_NAME'
  public packageName: string = 'PACKAGE_NAME'
  public versionName: string = 'VERSION_NUMBER'
  public versionCode: string | number = 'VERSION_CODE'

  constructor(
    @Inject(APP_INFO_PLUGIN) private readonly appInfo: AppInfoPlugin,
    private readonly platform: Platform,
    private readonly storage: VaultStorageService,
    private readonly alertController: AlertController,
    private readonly navigationService: NavigationService
  ) {
    this.updateVersions().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
  }

  public async updateVersions(): Promise<void> {
    if (this.platform.is('hybrid')) {
      const appInfo = await this.appInfo.get()

      this.appName = appInfo.appName
      this.packageName = appInfo.packageName
      this.versionName = appInfo.versionName
      this.versionCode = appInfo.versionCode
    }
  }

  public async review(): Promise<void> {
    this.showRatingAlert()
  }

  public github(): void {
    this.openLinkPage(
      'GitHub',
      'https://github.com/airgap-it/airgap-vault',
      `AirGap Vault is fully open source. Visit the GitHub repository to view the source code.`
    )
  }

  public twitter(): void {
    this.openLinkPage(
      'Twitter',
      'https://twitter.com/AirGap_it',
      `Follow our Twitter account to stay up to date with the latest developments.`
    )
  }

  public telegram(): void {
    this.openLinkPage(
      'Telegram',
      'https://t.me/AirGap',
      `Join our telegram channel to ask questions and hear about the latest developments.`
    )
  }

  public discord(): void {
    this.openLinkPage(
      'Discord',
      'https://discord.gg/gnWqCQsteh',
      `Join our discord server to ask questions and hear about the latest developments.`
    )
  }

  public feedback(): void {
    this.openLinkPage(
      'Feedback',
      'hi@airgap.it',
      `We're always happy to get feedback if you have suggestions or are experiencing bugs. Please write us an email.`
    )
  }

  public documentation(): void {
    this.openLinkPage(
      'Documentation',
      'https://support.airgap.it',
      `Our docs offer a comprehensive overview of the features and functionality of our app.`
    )
  }

  private openLinkPage(title: string, link: string, description?: string) {
    this.navigationService
      .routeWithState('/link-page', {
        title,
        link,
        description
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async showRatingAlert(): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'How do you like AirGap?',
      subHeader: '',
      buttons: [
        {
          text: `Not happy`,
          handler: async () => {
            this.handleNotHappy()
          }
        },
        {
          text: 'I love it!',
          handler: async () => {
            this.handleHappy()
          }
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }

  private async handleHappy() {
    const installationType = await this.storage.get(VaultStorageKey.INSTALLATION_TYPE)
    console.log('installationType', installationType)

    if (installationType === InstallationType.OFFLINE) {
      const alert: HTMLIonAlertElement = await this.alertController.create({
        header: 'Rate our App',
        subHeader: '',
        message: `Please visit the store where you downloaded AirGap Vault and give us a good review. It would help us a lot!`,
        buttons: [
          {
            text: `Ok`
          }
        ]
      })
      alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
    } else {
      // Redirect to store or trigger rating prompt.
    }
  }

  private async handleNotHappy() {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Give us feedback',
      subHeader: '',
      message: `We're sorry to hear you are having problems with our app. Please write us an email or reach out to us on Social Media so we can help.`,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
