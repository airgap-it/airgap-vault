import { Component } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { Secret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-bip85-generate',
  templateUrl: './bip85-generate.page.html',
  styleUrls: ['./bip85-generate.page.scss']
})
export class Bip85GeneratePage {
  public secret: Secret

  public mnemonicLength: '12' | '18' | '24' = '24'

  public index: string = '0'

  public isAdvancedMode: boolean = false
  public revealBip39Passphrase: boolean = false
  public bip39Passphrase: string = ''

  constructor(private readonly navigationService: NavigationService, private readonly alertController: AlertController) {
    if (this.navigationService.getState()) {
      this.secret = this.navigationService.getState().secret
      console.log(this.secret)
    }
  }

  public async generateChildSeed() {
    if (this.bip39Passphrase.length > 0) {
      const alert = await this.alertController.create({
        header: 'BIP39 Passphrase',
        message: 'You set a BIP39 Passphrase. You will need to enter this passphrase again when you try to derive the same child key!',
        backdropDismiss: false,
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
