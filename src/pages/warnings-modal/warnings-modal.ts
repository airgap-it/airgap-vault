import { Component } from '@angular/core'
import { IonicPage, NavParams, Platform, ViewController } from 'ionic-angular'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { Storage } from '@ionic/storage'

@IonicPage()
@Component({
  selector: 'page-warnings-modal',
  templateUrl: 'warnings-modal.html'
})
export class WarningsModalPage {
  private errorType: Warning

  private title: string
  private description: string
  private imageUrl: string
  private handler: Function
  private buttonText: string = 'Ok'

  constructor(
    public navParams: NavParams,
    private secureStorage: SecureStorageService,
    private platform: Platform,
    private viewCtrl: ViewController,
    private storage: Storage
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
        this.secureStorage.secureDevice()
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
      this.title = 'AirGap Disclaimer'
      this.description = `
        <p>
        You as the user hereby accept and acknowledge this protocol and all the information provided within to the fullest extent. You as the user confirm that the content this document has been reviewed, tested and understood on their own behalf.
        </p>
        <p>
        To the fullest extent permitted by applicable law:
        <ul>
          <li>All services provided by Papers GmbH, its employees, freelancers or other subcontractors are provided without representation and warranty of any kind</li>
          <li>Papers GmbH disclaims any and all direct and indirect liability for damage occurring under, or in connection with, this Protocol, especially, but not limited to loss of, or damage to, data, lost profit, compromised / hacked product or system, and or stolen / missing monetary funds.</li>
        </ul>
        </p>
        <p>
        You understand the risks involved in this software, including but no limited to losing your secret, thus private keys and access to your funds.
        </p>
      `

      this.imageUrl = null
      this.buttonText = 'I understand and accept'
      this.handler = () => {
        this.storage.set('DISCLAIMER_INITIAL', true).then(() => {
          this.viewCtrl.dismiss()
        })
      }
    }
  }
}

export enum Warning {
  SECURE_STORAGE,
  ROOT,
  SCREENSHOT,
  NETWORK,
  INITIAL_DISCLAIMER
}
