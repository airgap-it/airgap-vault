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
        consequence: async () => {
          await this.presentModal(WarningsModalPage, { errorType: Warning.ROOT })
        }
      },
      {
        name: 'deviceSecureCheck',
        check: () => secureStorage.isDeviceSecure(),
        outcome: true,
        consequence: async () => {
          await this.presentModal(WarningsModalPage, { errorType: Warning.SECURE_STORAGE })
        }
      },
      {
        name: 'disclaimerAcceptedCheck',
        check: () => this.storage.get('DISCLAIMER_INITIAL'),
        outcome: true,
        consequence: async () => {
          await this.presentModal(WarningsModalPage, { errorType: Warning.INITIAL_DISCLAIMER })
        }
      },
      {
        name: 'introductionAcceptedCheck',
        check: () => this.storage.get('INTRODUCTION_INITIAL'),
        outcome: true,
        consequence: async () => {
          await this.presentModal(IntroductionPage, {})
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
        consequence: async () => {
          await this.presentModal(DistributionOnboardingPage, {})
        }
      }
    ]
  }

  async presentModal(page: any, modalConfig: any): Promise<any> {
    return new Promise(async resolve => {
      let modal = this.modalController.create(page, modalConfig, { enableBackdropDismiss: false })
      modal
        .present()
        .then(() => {
          console.log('check modal presented')
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      modal.onDidDismiss(_data => resolve())
    })
  }

  initChecks(): Promise<Function> {
    return new Promise(async resolve => {
      for (const check of this.checks) {
        if (+(await check.check()) !== +check.outcome) {
          await check.consequence()
        }
      }
      resolve()
    })
  }
}
