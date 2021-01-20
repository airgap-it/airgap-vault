import { Component, OnInit } from '@angular/core'
import { DeviceService } from 'src/app/services/device/device.service'
import { NetworkService } from 'src/app/services/network/network.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'

enum CheckStatus {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAIL = 'fail'
}

// enum CheckIcons {
//   WIFI = 'wifi',
//   UNLOCK = 'unlock',
//   SAVE = 'save',
//   RADIO = 'radio',
//   PHONE = 'phone-portrait',
//   NOTIFICATION = 'notifications', // notifications-outline
//   LOCK = 'lock',
//   INFORMATION = 'information-circle-outline',
//   HELP = 'help-circle',
//   FINGERPRINT = 'finger-print',
//   CLOUD = 'cloud', // cloud-circle / cloud-outline
//   CELLULAR = 'cellular',
//   BATTERY = 'battery-full',
//   BLUETOOTH = 'bluetooth',
//   SUCCESS = 'checkmark-circle',
//   WARNING = 'alert', // warning
//   FAIL = 'close-circle'
// }

/* To check
# Connection
- WIFI disabled
- Cellular disabled
- Bluetooth disabled
- Cable disconnected
- Internet access (CSP?)

# Device
- Is unrooted
- Has secure storage

# Secrets
- Storage is accessible
- Has backup (verified)
- Has show again disabled (should be a new setting)
- Has social recovery created
- Has verified backup recently

*/

interface CheckItem {
  title: string
  description: string
  status: CheckStatus
  delay: number
  check: () => Promise<boolean>
}

@Component({
  selector: 'airgap-security-check',
  templateUrl: './security-check.page.html',
  styleUrls: ['./security-check.page.scss']
})
export class SecurityCheckPage implements OnInit {
  items: CheckItem[]

  constructor(
    private readonly networkSerice: NetworkService,
    private readonly secureStorageService: SecureStorageService,
    private readonly deviceService: DeviceService
  ) {
    this.items = [
      {
        title: 'Device Internet',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 200,
        check: async () => {
          return !(await this.networkSerice.capacitorCanAccessInternet())
        }
      },
      {
        title: 'Webview Internet',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return !(await this.networkSerice.webviewCanAccessInternet())
        }
      },
      {
        title: 'App Internet',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 500,
        check: async () => {
          return !(await this.networkSerice.appCanAccessInternet())
        }
      },
      {
        title: 'Device is unrooted',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return !(await this.deviceService.checkForRoot())
        }
      },
      {
        title: 'Secure storage available',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return !(await this.secureStorageService.isDeviceSecure())
        }
      },
      {
        title: 'TODO: Secret X has been backed up',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return true
        }
      },
      {
        title: 'TODO: Secret X is available in secure storage',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return true
        }
      },
      {
        title: 'TODO: Secret X backup has been verified recently',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          return true
        }
      }
    ]
  }

  ngOnInit() {}

  async runChecks() {
    this.items.forEach((item) => (item.status = CheckStatus.UNKNOWN))
    for (let i = 0; i < this.items.length; i++) {
      const element = this.items[i]
      element.status = CheckStatus.PENDING
      await new Promise((resolve) => setTimeout(resolve, element.delay))
      element.status = (await element.check()) ? CheckStatus.SUCCESS : CheckStatus.FAIL
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}
