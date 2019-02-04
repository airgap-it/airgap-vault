import { Component } from '@angular/core'
import { IonicPage, NavParams, Platform, ViewController } from 'ionic-angular'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { Storage } from '@ionic/storage'
import { TranslateService } from '@ngx-translate/core'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

export enum Warning {
  SECURE_STORAGE,
  ROOT,
  SCREENSHOT,
  NETWORK,
  INITIAL_DISCLAIMER
}

@IonicPage()
@Component({
  selector: 'page-warnings-modal',
  templateUrl: 'warnings-modal.html'
})
export class WarningsModalPage {
  private errorType: Warning

  public title: string
  public description: string
  public imageUrl: string
  public handler: Function
  public buttonText: string = 'Ok'

  constructor(
    public navParams: NavParams,
    private secureStorage: SecureStorageService,
    private platform: Platform,
    private viewCtrl: ViewController,
    private storage: Storage,
    private translateService: TranslateService
  ) {
    this.errorType = navParams.get('errorType')
  }

  ngAfterViewInit() {
    if (this.errorType === Warning.ROOT) {
      this.title = 'Your device is rooted'
      this.description =
        'It seems like you have rooted your device. While we think this is neat, it weakens the security of your device significantly and we multiple mechanisms of AirGap can be circumvented by other apps. Therefore, AirGap is not able to run on this device.'
      this.imageUrl = './assets/img/root_detection.svg'
      this.handler = () => {
        this.platform.exitApp()
      }
    }

    if (this.errorType === Warning.SCREENSHOT) {
      this.title = 'Screenshot detected'
      this.description =
        'Looks like you just took a screenshot. Make sure that you never take a screenshot you might expose your secret key.'
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.handler = () => {
        this.platform.exitApp()
      }
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
      this.handler = () => {
        this.platform.exitApp()
      }
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
          let title: string = values['warnings-modal.disclaimer.title']
          let text: string = values['warnings-modal.disclaimer.text']
          let list_text: string = values['warnings-modal.disclaimer.disclaimer-list.text']
          let list_item1_text: string = values['warnings-modal.disclaimer.disclaimer-list.item-1_text']
          let list_item2_text: string = values['warnings-modal.disclaimer.disclaimer-list.item-2_text']
          let description_text: string = values['warnings-modal.disclaimer.description']
          let label: string = values['warnings-modal.disclaimer.understood_label']
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
            this.storage
              .set('DISCLAIMER_INITIAL', true)
              .then(() => {
                this.viewCtrl.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
              })
              .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
          }
        })
    }
  }
}
