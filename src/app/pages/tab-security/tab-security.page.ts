import { Component } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { first } from 'rxjs/operators'
import { NetworkService } from 'src/app/services/network/network.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { DeviceService } from 'src/app/services/device/device.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

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

interface CheckGroup {
  name: string
  showChecks: boolean
  status: CheckStatus
  checks: CheckItem[]
}

interface CheckItem {
  title: string
  description: string
  status: CheckStatus
  delay: number
  successStatus(): Promise<CheckStatus>
  failureStatus(): Promise<CheckStatus>
  check: () => Promise<boolean>
}

@Component({
  selector: 'airgap-tab-security',
  templateUrl: './tab-security.page.html',
  styleUrls: ['./tab-security.page.scss']
})
export class TabSecurityPage {
  groups: CheckGroup[]

  checksRunning: boolean = false

  constructor(
    private readonly networkSerice: NetworkService,
    private readonly secureStorageService: SecureStorageService,
    private readonly deviceService: DeviceService,
    private readonly secretsService: SecretsService,
    private readonly alertCtrl: AlertController
  ) {
    this.groups = [
      {
        name: `Connectivity`,
        status: CheckStatus.UNKNOWN,
        showChecks: false,
        checks: [
          {
            title: 'Device Internet',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 200,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              return !(await this.networkSerice.capacitorCanAccessInternet())
            }
          },
          {
            title: 'Webview Internet',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              return !(await this.networkSerice.webviewCanAccessInternet())
            }
          },
          {
            title: 'App Internet',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 500,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              return !(await this.networkSerice.appCanAccessInternet())
            }
          }
        ]
      },
      {
        name: `Device`,
        status: CheckStatus.UNKNOWN,
        showChecks: false,
        checks: [
          {
            title: 'Device is unrooted',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              return !(await this.deviceService.checkForRoot())
            }
          },
          {
            title: 'Device OS up to date',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.WARNING,
            check: async () => {
              return false
            }
          },
          {
            title: 'Software updated recently',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.WARNING,
            check: async () => {
              return false
            }
          },
          {
            title: 'Secure storage available',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              return !(await this.secureStorageService.isDeviceSecure())
            }
          },
          {
            title: 'Checking randomness',
            description: 'Description',
            status: CheckStatus.UNKNOWN,
            delay: 100,
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
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
              for (let i = 0; i < 10000; i++) {
                const secureRandomArray = new Uint8Array(32)
                window.crypto.getRandomValues(secureRandomArray)
                if (results.has(secureRandomArray.toString())) {
                  return false
                } else {
                  results.add(secureRandomArray.toString())
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
            successStatus: async () => CheckStatus.SUCCESS,
            failureStatus: async () => CheckStatus.FAIL,
            check: async () => {
              // Generate address for all protocols from a known seed
              return this.generateAddresses()
            }
          }
        ]
      }
    ]
  }

  ngOnInit() {
    this.secretsService
      .getSecretsObservable()
      .pipe(first())
      .subscribe((secrets) => {
        secrets.forEach((secret) => {
          this.groups.push({
            name: `Secret "${secret.label}"`,
            status: CheckStatus.UNKNOWN,
            showChecks: false,
            checks: [
              {
                title: `Not in memory`,
                description: 'Description',
                status: CheckStatus.UNKNOWN,
                delay: 100,
                successStatus: async () => CheckStatus.SUCCESS,
                failureStatus: async () => CheckStatus.FAIL,
                check: async () => {
                  return !secret.secretHex
                }
              },
              {
                title: `Password enabled`,
                description: 'Description',
                status: CheckStatus.UNKNOWN,
                delay: 100,
                successStatus: async () => CheckStatus.SUCCESS,
                failureStatus: async () => CheckStatus.WARNING,
                check: async () => {
                  return secret.isParanoia
                }
              },
              {
                title: `Has Social Recovery`,
                description: 'Description',
                status: CheckStatus.UNKNOWN,
                delay: 100,
                successStatus: async () => CheckStatus.SUCCESS,
                failureStatus: async () => CheckStatus.WARNING,
                check: async () => {
                  return secret.hasSocialRecovery
                }
              },
              {
                title: `Can access secure storage`,
                description: 'Description',
                status: CheckStatus.UNKNOWN,
                delay: 100,
                successStatus: async () => CheckStatus.SUCCESS,
                failureStatus: async () => CheckStatus.FAIL,
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
              }
            ]
          })
        })
      })
  }

  async runChecks() {
    if (this.checksRunning) {
      return
    }
    this.checksRunning = true

    this.groups.forEach((group) => {
      group.status = CheckStatus.UNKNOWN
      group.checks.forEach((check) => (check.status = CheckStatus.UNKNOWN))
    })

    for (const group of this.groups) {
      group.status = CheckStatus.PENDING

      let status = CheckStatus.SUCCESS

      for (const item of group.checks) {
        item.status = CheckStatus.PENDING
        await new Promise((resolve) => setTimeout(resolve, item.delay))
        item.status = (await item.check()) ? await item.successStatus() : await item.failureStatus()
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (item.status === CheckStatus.FAIL) {
          status = CheckStatus.FAIL
        } else if (status !== CheckStatus.FAIL && item.status === CheckStatus.WARNING) {
          status = CheckStatus.WARNING
        }
      }

      group.status = status
    }

    this.checksRunning = false
  }

  public toggleShow(group: CheckGroup) {
    group.showChecks = !group.showChecks
  }

  async showDescription(item: CheckItem) {
    const alert = await this.alertCtrl.create({
      header: item.title,
      message: item.description,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    alert.present()
  }

  private generateAddresses() {
    return true
  }
}
