import { Component, OnInit } from '@angular/core'
import { first } from 'rxjs/operators'
import { DeviceService } from 'src/app/services/device/device.service'
import { NetworkService } from 'src/app/services/network/network.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'

enum CheckStatus {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  SUCCESS = 'success',
  WARNING = 'warning',
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

  checksRunning: boolean = false

  constructor(
    private readonly networkSerice: NetworkService,
    private readonly secureStorageService: SecureStorageService,
    private readonly deviceService: DeviceService,
    private readonly secretsService: SecretsService
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
        title: 'Checking randomness',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          const results = new Set()
          for (let i = 0; i < 10000; i++) {
            const random = Math.random()
            if (results.has(random)) {
              return false
            } else {
              results.add(random)
            }
          }
          for (let i = 0; i < 10; i++) {
            const secureRandomArray = new Uint8Array(32)
            window.crypto.getRandomValues(secureRandomArray)
            if (results.has(secureRandomArray.toString())) {
              return false
            } else {
              results.add(secureRandomArray.toString())
              console.log('has', secureRandomArray.toString())
            }
          }
          return true
        }
      },
      {
        title: 'Checking address generation',
        description: 'Description',
        status: CheckStatus.UNKNOWN,
        delay: 100,
        check: async () => {
          // Generate address for all protocols from a known seed
          return this.generateAddresses()
        }
      }
    ]
  }

  ngOnInit() {
    this.secretsService
      .getSecretsObservable()
      .pipe(first())
      .subscribe((secrets) => {
        secrets.forEach((secret) => {
          this.items.push({
            title: `Checking Secret "${secret.label}" (Should not be in memory)`,
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            check: async () => {
              return !secret.secretHex
            }
          })

          this.items.push({
            title: `Checking Secret "${secret.label}" (is Paranoia)`,
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            check: async () => {
              return secret.isParanoia
            }
          })

          this.items.push({
            title: `Checking Secret "${secret.label}" (has social recovery)`,
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            check: async () => {
              return secret.hasSocialRecovery
            }
          })

          this.items.push({
            title: `Checking Secret "${secret.label}" (can read secret)`,
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            check: async () => {
              // TODO: Can we add a method to "check" the storage without actually reading it?
              const secureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)
              try {
                await secureStorage.getItem(secret.id).then(() => undefined)
                return true
              } catch (e) {
                return false
              }
            }
          })
        })
      })
  }

  async runChecks() {
    if (this.checksRunning) {
      return
    }
    this.checksRunning = true

    this.items.forEach((item) => (item.status = CheckStatus.UNKNOWN))
    for (let i = 0; i < this.items.length; i++) {
      const element = this.items[i]
      element.status = CheckStatus.PENDING
      await new Promise((resolve) => setTimeout(resolve, element.delay))
      element.status = (await element.check()) ? CheckStatus.SUCCESS : CheckStatus.FAIL
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.checksRunning = false
  }

  private generateAddresses() {
    return true
  }
}
