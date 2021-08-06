import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-danger-zone',
  templateUrl: './danger-zone.page.html',
  styleUrls: ['./danger-zone.page.scss']
})
export class DangerZonePage implements OnInit {
  constructor(
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService,
    private readonly storageService: VaultStorageService,
    private readonly secureStorage: SecureStorageService,
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService
  ) {}

  ngOnInit() {}

  async resetVault() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe.alert.title'),
      message: this.translateService.instant('danger-zone.wipe.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe.alert.cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('danger-zone.wipe.alert.ok'),
          handler: async () => {
            const secrets = await this.secretsService.getSecretsObservable().pipe(first()).toPromise()
            await Promise.all([this.storageService.wipe(), this.secureStorage.wipe(secrets)])
            this.navigationService.route('/').then(() => {
              location.reload()
            })
          }
        }
      ]
    })
    alert.present()
  }
}
