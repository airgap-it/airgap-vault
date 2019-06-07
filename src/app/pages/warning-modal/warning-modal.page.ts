import { AfterViewInit, Component } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { TranslateService } from '@ngx-translate/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecureStorageService } from '../../services/storage/storage.service'

export enum Warning {
  SECURE_STORAGE,
  ROOT,
  SCREENSHOT,
  NETWORK,
  INITIAL_DISCLAIMER
}

@Component({
  selector: 'airgap-warning-modal',
  templateUrl: './warning-modal.page.html',
  styleUrls: ['./warning-modal.page.scss']
})
export class WarningModalPage implements AfterViewInit {
  private readonly errorType: Warning

  public title: string
  public description: string
  public imageUrl: string
  public handler: () => void = () => {}
  public buttonText: string = 'Ok'

  constructor(
    public navParams: NavParams,
    private readonly secureStorage: SecureStorageService,
    private readonly modalController: ModalController,
    private readonly storage: Storage,
    private readonly translateService: TranslateService
  ) {}

  public ngAfterViewInit() {
    if (this.errorType === Warning.ROOT) {
      this.title = 'Your device is rooted'
      this.description =
        'It seems like you have rooted your device. While we think this is neat, it weakens the security of your device significantly and we multiple mechanisms of AirGap can be circumvented by other apps. Therefore, AirGap is not able to run on this device.'
      this.imageUrl = './assets/img/root_detection.svg'
      this.handler = () => {}
    }

    if (this.errorType === Warning.SCREENSHOT) {
      this.title = 'Screenshot detected'
      this.description =
        'Looks like you just took a screenshot. Make sure that you never take a screenshot you might expose your secret key.'
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.handler = () => {}
    }

    if (this.errorType === Warning.SECURE_STORAGE) {
      this.title = 'Device Unsecure'
      this.description =
        'Your lockscreen needs to be setup in order to properly encrypt and protect your secrets. After securing your device, please close and restart AirGap.'
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.buttonText = 'Secure Device'
      this.handler = () => {
        this.secureStorage.secureDevice().catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
      }
    }

    if (this.errorType === Warning.NETWORK) {
      this.title = 'Network Connection detected'
      this.description =
        'Looks like you have connected this device to a network. The AirGap App has no network priviledges but it is best to disconnect the device entierly from any network.'
      this.imageUrl = './assets/img/network_connection.svg'
      this.handler = () => {}
    }

    if (this.errorType === Warning.INITIAL_DISCLAIMER) {
      this.translateService
        .get([
          'warnings-modal.disclaimer.title',
          'warnings-modal.disclaimer.text',
          'warnings-modal.disclaimer.disclaimer-list.text',
          'warnings-modal.disclaimer.disclaimer-list.item-1_text',
          'warnings-modal.disclaimer.disclaimer-list.item-2_text',
          'warnings-modal.disclaimer.description',
          'warnings-modal.disclaimer.understood_label'
        ])
        .subscribe(values => {
          const title: string = values['warnings-modal.disclaimer.title']
          const text: string = values['warnings-modal.disclaimer.text']
          const list_text: string = values['warnings-modal.disclaimer.disclaimer-list.text']
          const list_item1_text: string = values['warnings-modal.disclaimer.disclaimer-list.item-1_text']
          const list_item2_text: string = values['warnings-modal.disclaimer.disclaimer-list.item-2_text']
          const description_text: string = values['warnings-modal.disclaimer.description']
          const label: string = values['warnings-modal.disclaimer.understood_label']
          this.title = title
          this.description =
            '<p><strong>' +
            text +
            '</strong></p><p>' +
            list_text +
            '<ul><li>' +
            list_item1_text +
            '</li><li>' +
            list_item2_text +
            '</li></ul></p><p>' +
            description_text +
            '</p>'

          this.imageUrl = null
          this.buttonText = label
          this.handler = () => {
            console.log('handler called')
            this.storage
              .set('DISCLAIMER_INITIAL', true)
              .then(() => {
                this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
              })
              .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
          }
        })
    }
  }
}
