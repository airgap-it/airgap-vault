import { Injectable } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { WarningModalPage, Warning } from '../../pages/warning-modal/warning-modal.page'

import { DistributionOnboardingPage } from '../../pages/distribution-onboarding/distribution-onboarding.page'
import { IntroductionPage } from '../../pages/introduction/introduction.page'
import { DeviceService } from '../device/device.service'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { SecureStorageService } from '../storage/storage.service'
import { ComponentRef, ModalOptions } from '@ionic/core'

export interface Check {
  name: string
  expectedOutcome: boolean
  check(): Promise<boolean>
  failureConsequence(callback: () => void): void
}

@Injectable({
  providedIn: 'root'
})
export class StartupChecksService {
  public checks: Check[]

  constructor(
    private readonly secureStorage: SecureStorageService,
    private readonly deviceProvider: DeviceService,
    private readonly modalController: ModalController,
    private readonly storage: Storage
  ) {
    this.checks = [
      {
        name: 'rootCheck',
        expectedOutcome: false,
        check: (): Promise<boolean> => this.deviceProvider.checkForRoot(),
        failureConsequence: (callback: () => void): void => {
          this.presentModal(WarningModalPage, { errorType: Warning.ROOT }, callback).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'deviceSecureCheck',
        expectedOutcome: true,
        check: async (): Promise<boolean> => {
          const result: number = await this.secureStorage.isDeviceSecure()

          return Boolean(result).valueOf()
        },
        failureConsequence: (callback: () => void): void => {
          this.presentModal(WarningModalPage, { errorType: Warning.SECURE_STORAGE }, callback).catch(
            handleErrorLocal(ErrorCategory.INIT_CHECK)
          )
        }
      },
      {
        name: 'disclaimerAcceptedCheck',
        expectedOutcome: true,
        check: (): Promise<boolean> => this.storage.get('DISCLAIMER_INITIAL'),
        failureConsequence: (callback: () => void): void => {
          this.presentModal(WarningModalPage, { errorType: Warning.INITIAL_DISCLAIMER }, callback).catch(
            handleErrorLocal(ErrorCategory.INIT_CHECK)
          )
        }
      },
      {
        name: 'introductionAcceptedCheck',
        expectedOutcome: true,
        check: (): Promise<boolean> => this.storage.get('INTRODUCTION_INITIAL'),
        failureConsequence: (callback: () => void): void => {
          this.presentModal(IntroductionPage, {}, callback).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'electronCheck',
        expectedOutcome: true,
        check: async (): Promise<boolean> => {
          const isElectron: boolean = await deviceProvider.checkForElectron()
          const hasShownDisclaimer: boolean = await this.storage.get('DISCLAIMER_ELECTRON')

          return !isElectron || hasShownDisclaimer
        },
        failureConsequence: (callback: () => void): void => {
          this.presentModal(DistributionOnboardingPage, {}, callback).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      }
    ]
  }

  public async presentModal(page: ComponentRef, properties: ModalOptions['componentProps'], callback: Function): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: page,
      componentProps: properties,
      backdropDismiss: false
    })

    modal
      .onDidDismiss()
      .then(() => {
        callback()
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

    modal
      .present()
      .then(() => {
        console.log('check modal presented')
      })
      .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public initChecks(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const results: void | (boolean)[] = await Promise.all(this.checks.map((check: Check) => check.check())).catch(
        handleErrorLocal(ErrorCategory.INIT_CHECK)
      )

      if (!results) {
        return
      }

      const failedIndex: number = results.findIndex((checkOutcome: boolean, index: number) => {
        return checkOutcome !== this.checks[index].expectedOutcome
      })

      if (failedIndex === -1) {
        resolve()

        return
      }

      reject(this.checks[failedIndex])
    })
  }
}
