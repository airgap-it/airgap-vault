import { Component } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

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
  public isAppAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly navigationService: NavigationService,
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService,
    private readonly storageService: VaultStorageService
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

  public onIndexBlur(_event: any): void {
    let value = Number(this.index)
    if (isNaN(value)) {
      this.index = '0'
      return
    }

    if (value > 2147483647) {
      value = 2147483647
    } else if (value < 0) {
      value = 0
    }

    this.index = value.toString()
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
