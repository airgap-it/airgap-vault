import { Component } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-bip85-generate',
  templateUrl: './bip85-generate.page.html',
  styleUrls: ['./bip85-generate.page.scss']
})
export class Bip85GeneratePage {
  public secret: MnemonicSecret

  public mnemonicLength: '12' | '18' | '24' = '24'

  public index: string = '0'

  public isAdvancedMode: boolean = false
  public revealBip39Passphrase: boolean = false
  public bip39Passphrase: string = ''

  constructor(
    private readonly navigationService: NavigationService,
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService
  ) {
    if (this.navigationService.getState()) {
      this.secret = this.navigationService.getState().secret
    }
  }

  public async generateChildSeed() {
    if (this.bip39Passphrase.length > 0 && this.isAdvancedMode) {
      const alert = await this.alertController.create({
        header: this.translateService.instant('bip85-generate.alert.header'),
        message: this.translateService.instant('bip85-generate.alert.message'),
        backdropDismiss: false,
        inputs: [
          {
            name: 'understood',
            type: 'checkbox',
            label: this.translateService.instant('bip85-generate.alert.understand'),
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
            text: 'Ok',
            handler: async (result: string[]) => {
              if (result.includes('understood')) {
                this.navigateToNextPage()
              }
            }
          }
        ]
      })
      alert.present()
    } else {
      this.navigateToNextPage()
    }
  }

  private async navigateToNextPage() {
    this.navigationService
      .routeWithState('/bip85-show', {
        secret: this.secret,
        bip39Passphrase: this.isAdvancedMode ? this.bip39Passphrase : '',
        mnemonicLength: Number(this.mnemonicLength),
        index: Number(this.index)
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
