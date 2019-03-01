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
      this.translateService.get(['warnings-modal.root.title', 'warnings-modal.root.description']).subscribe(values => {
        let title = values['warnings-modal.root.title']
        let description = values['warnings-modal.root.description']
        this.title = title
        this.description = description
        this.imageUrl = './assets/img/root_detection.svg'
        this.handler = () => {
          this.platform.exitApp()
        }
      })
    }

    if (this.errorType === Warning.SCREENSHOT) {
      this.translateService.get(['warnings-modal.screenshot.title', 'warnings-modal.screenshot.description']).subscribe(values => {
        let title = values['warnings-modal.screenshot.title']
        let description = values['warnings-modal.screenshot.description']
        this.title = title
        this.description = description
        this.imageUrl = './assets/img/screenshot_detected.svg'
        this.handler = () => {
          this.platform.exitApp()
        }
      })
    }

    if (this.errorType === Warning.SECURE_STORAGE) {
      this.translateService
        .get([
          'warnings-modal.secure_storage.title',
          'warnings-modal.secure_storage.description',
          'warnings-modal.secure_storage.button_text'
        ])
        .subscribe(values => {
          let title = values['warnings-modal.secure_storage.title']
          let description = values['warnings-modal.secure_storage.description']
          let buttonText = values['warnings-modal.secure_storage.button_text']
          this.title = title
          this.description = description
          this.imageUrl = './assets/img/screenshot_detected.svg'
          this.buttonText = buttonText
          this.handler = () => {
            this.secureStorage.secureDevice().catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
          }
        })
    }

    if (this.errorType === Warning.NETWORK) {
      this.translateService.get(['warnings-modal.network.title', 'warnings-modal.network.description']).subscribe(values => {
        let title = values['warnings-modal.network.title']
        let description = values['warnings-modal.network.description']
        this.title = title
        this.description = description
        this.imageUrl = './assets/img/network_connection.svg'
        this.handler = () => {
          this.platform.exitApp()
        }
      })
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
