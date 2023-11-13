import { Component } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

import { SHOW_SECRET_MIN_TIME_IN_SECONDS } from '../../constants/constants'
import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-show',
  templateUrl: './secret-show.page.html',
  styleUrls: ['./secret-show.page.scss']
})
export class SecretShowPage {
  public readonly secret: MnemonicSecret
  public readonly startTime: Date = new Date()

  public lifehashData: string | undefined

  public isBlurred: boolean = true
  blurText =
    '****** **** ***** **** ******* ***** ***** ****** ***** *** ***** ******* ***** **** ***** ********* ***** ****** ***** **** ***** ******* ***** ****'

  public isAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly deviceService: DeviceService,
    private readonly navigationService: NavigationService,
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService,
    private readonly lifehashService: LifehashService,
    private readonly storageService: VaultStorageService
  ) {
    this.secret = this.navigationService.getState().secret
  }

  public async ionViewDidEnter(): Promise<void> {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-setup' })
    this.lifehashData = await this.lifehashService.generateLifehash(this.secret.fingerprint)
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public timeout: NodeJS.Timer

  changeBlur() {
    this.isBlurred = !this.isBlurred

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.isBlurred = true
    }, 30_000)
  }

  public goToValidateSecret(): void {
    if (this.startTime.getTime() + SHOW_SECRET_MIN_TIME_IN_SECONDS * 1000 > new Date().getTime()) {
      this.translateService
        .get([
          'secret-show.too-fast_alert.title',
          'secret-show.too-fast_alert.heading',
          'secret-show.too-fast_alert.text',
          'secret-show.too-fast_alert.wait_label_p1',
          'secret-show.too-fast_alert.wait_label_p2'
        ])
        .pipe(first())
        .subscribe(async (values: string[]) => {
          const title: string = values['secret-show.too-fast_alert.title']
          const heading: string = values['secret-show.too-fast_alert.heading']
          const text: string = values['secret-show.too-fast_alert.text']
          const waitLabelP1: string = values['secret-show.too-fast_alert.wait_label_p1']
          const waitLabelP2: string = values['secret-show.too-fast_alert.wait_label_p2']

          const alert: HTMLIonAlertElement = await this.alertController.create({
            header: title,
            message: `${heading} <br/> ${text} <br/> ${waitLabelP1} <strong>${SHOW_SECRET_MIN_TIME_IN_SECONDS.toString()}${waitLabelP2}</strong>`,
            buttons: ['Okay']
          })
          alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
        })
    } else {
      this.navigationService
        .routeWithState('secret-validate', { secret: this.secret })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
