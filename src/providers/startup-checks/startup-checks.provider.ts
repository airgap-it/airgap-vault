import 'jasmine'
import { Injectable } from '@angular/core'
import { IntroductionPage } from '../../pages/introduction/introduction'
import { WarningsModalPage, Warning } from '../../pages/warnings-modal/warnings-modal'
import { DeviceProvider } from '../device/device'
import { ModalController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { SecureStorageService } from '../storage/secure-storage'
import { DistributionOnboardingPage } from '../../pages/distribution-onboarding/distribution-onboarding'
import { handleErrorLocal, ErrorCategory } from '../error-handler/error-handler'

@Injectable()
export class StartupChecksProvider {
  checks: { name: string; check: Function; outcome: boolean; consequence: Function }[]

  constructor(
    secureStorage: SecureStorageService,
    deviceProvider: DeviceProvider,
    private modalController: ModalController,
    private storage: Storage
  ) {
    this.checks = [
      {
        name: 'rootCheck',
        check: () => deviceProvider.checkForRoot(),
        outcome: false,
        consequence: (cb: Function) => {
          this.presentModal(WarningsModalPage, { errorType: Warning.ROOT }, cb)
        }
      },
      {
        name: 'deviceSecureCheck',
        check: () => secureStorage.isDeviceSecure(),
        outcome: true,
        consequence: (cb: Function) => {
          this.presentModal(WarningsModalPage, { errorType: Warning.SECURE_STORAGE }, cb)
        }
      },
      {
        name: 'disclaimerAcceptedCheck',
        check: () => this.storage.get('DISCLAIMER_INITIAL'),
        outcome: true,
        consequence: (cb: Function) => {
          this.presentModal(WarningsModalPage, { errorType: Warning.INITIAL_DISCLAIMER }, cb)
        }
      },
      {
        name: 'introductionAcceptedCheck',
        check: () => this.storage.get('INTRODUCTION_INITIAL'),
        outcome: true,
        consequence: (cb: Function) => {
          this.presentModal(IntroductionPage, {}, cb)
        }
      },
      {
        name: 'electronCheck',
        check: (): Promise<boolean> => {
          return new Promise(async resolve => {
            const isElectron = await deviceProvider.checkForElectron()
            const hasShownDisclaimer = await this.storage.get('DISCLAIMER_ELECTRON')
            resolve(!isElectron || hasShownDisclaimer)
          })
        },
        outcome: true,
        consequence: (cb: Function) => {
          this.presentModal(DistributionOnboardingPage, {}, cb)
        }
      }
    ]
  }

  presentModal(page: any, modalConfig: any, callback: Function) {
    let modal = this.modalController.create(page, modalConfig, { enableBackdropDismiss: false })
    modal.onDidDismiss(_data => callback())
    modal
      .present()
      .then(() => {
        console.log('check modal presented')
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  initChecks(): Promise<Function> {
    return new Promise((resolve, reject) => {
      this.checks
        .reduce((promiseChain, currentTask) => {
          return promiseChain.then(chainResults => currentTask.check().then(currentResult => [...chainResults, currentResult]))
        }, Promise.resolve([]))
        .then(arrayOfResults => {
          let failedIndex = arrayOfResults.findIndex((val, index) => {
            if (typeof val === 'number') {
              val = Boolean(val).valueOf()
            }
            return val !== this.checks[index].outcome
          })

          if (failedIndex === -1) {
            resolve()
            return
          }

          reject(this.checks[failedIndex])
        })
        .catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
    })
  }
}
