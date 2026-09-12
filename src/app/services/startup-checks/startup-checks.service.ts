import { Injectable } from '@angular/core'
import { ComponentRef, ModalOptions } from '@ionic/core'
import { first } from 'rxjs/operators'
import { InstallationTypePage } from 'src/app/pages/Installation-type/installation-type.page'
import { OnboardingWelcomePage } from 'src/app/pages/onboarding-welcome/onboarding-welcome.page'

import { DistributionOnboardingPage } from '../../pages/distribution-onboarding/distribution-onboarding.page'
import { IntroductionPage } from '../../pages/introduction/introduction.page'
import { Warning, WarningModalPage } from '../../pages/warning-modal/warning-modal.page'
import { DeviceService } from '../device/device.service'
import { VaultEnvironmentService } from '../environment/vault-environment.service'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { SecureStorageService } from '../secure-storage/secure-storage.service'
import { InstallationType, InteractionType, VaultStorageKey, VaultStorageService } from '../storage/storage.service'
import { InteractionSelectionSettingsPage } from 'src/app/pages/interaction-selection-settings/interaction-selection-settings.page'
import { ModalAccessibilityService } from '../modal-accessibility/modal-accessibility.service'

export interface Check {
  name: string
  successOutcome: boolean
  check(): Promise<boolean>
  failureConsequence(): Promise<void>
}

interface StartupModalMetadata {
  /**
   * Startup onboarding steps are required: their persisted completion state is
   * the condition that allows the following check to run.
   */
  required?: boolean
  translationKey?: string
  /** The onboarding page announces changes in its own content. */
  manageInitialFocus?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class StartupChecksService {
  public checks: Check[]

  constructor(
    private readonly secureStorageService: SecureStorageService,
    private readonly deviceService: DeviceService,
    private readonly modalAccessibilityService: ModalAccessibilityService,
    private readonly storageService: VaultStorageService,
    private readonly environmentService: VaultEnvironmentService
  ) {
    this.checks = [
      {
        name: 'rootCheck',
        successOutcome: false,
        check: (): Promise<boolean> => this.deviceService.checkForRoot(),
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(WarningModalPage, { errorType: Warning.ROOT }, {
            translationKey: 'warnings-modal.root.title'
          }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'deviceSecureCheck',
        successOutcome: true,
        check: async (): Promise<boolean> => {
          const result = await this.secureStorageService.isDeviceSecure()

          return Boolean(result.value).valueOf()
        },
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(WarningModalPage, { errorType: Warning.SECURE_STORAGE }, {
            translationKey: 'warnings-modal.secure-storage.title'
          }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'disclaimerAcceptedCheck',
        successOutcome: true,
        check: (): Promise<boolean> => this.storageService.get(VaultStorageKey.DISCLAIMER_INITIAL),
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(OnboardingWelcomePage, { isInitialOnboarding: true }, {
            required: true,
            translationKey: 'onboarding-welcome.title',
            manageInitialFocus: false
          }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'installationType',
        successOutcome: true,
        check: (): Promise<boolean> =>
          this.storageService.get(VaultStorageKey.INSTALLATION_TYPE).then((type) => type !== InstallationType.UNDETERMINED),
        failureConsequence: async (): Promise<void> => {
          const context = await this.environmentService.getContextObservable().pipe(first()).toPromise()
          if (context === 'knox') {
            await this.storageService.set(VaultStorageKey.INSTALLATION_TYPE, InstallationType.OFFLINE)
            await this.storageService.set(VaultStorageKey.INTERACTION_TYPE, InteractionType.QR_CODE)
          } else {
            await this.presentModal(InstallationTypePage, { isInitialOnboarding: true }, {
              required: true,
              translationKey: 'installation-type.title',
              manageInitialFocus: false
            }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
          }
        }
      },
      {
        name: 'interactionType',
        successOutcome: true,
        check: async (): Promise<boolean> => {
          // case1: online --> show interaction type page
          // case2: offline --> don't show interaction type page, set interaction type to be offline

          return await Promise.all([
            this.storageService.get(VaultStorageKey.INTERACTION_TYPE),
            this.storageService.get(VaultStorageKey.INSTALLATION_TYPE)
          ]).then(([interactionType, installationType]) => {
            if (interactionType === InteractionType.UNDETERMINED) {
              if (installationType === InstallationType.OFFLINE) {
                // case2
                this.storageService.set(VaultStorageKey.INTERACTION_TYPE, InteractionType.QR_CODE)
                return true
              } else {
                // case1
                return false
              }
            } else {
              return true
            }
          })
        },
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(InteractionSelectionSettingsPage, {}).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'introductionAcceptedCheck',
        successOutcome: true,
        check: async (): Promise<boolean> => {
          const res = this.storageService.get(VaultStorageKey.INTRODUCTION_INITIAL)
          return res
        },
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(IntroductionPage, { isInitialOnboarding: true }, {
            required: true,
            translationKey: 'introduction.title',
            manageInitialFocus: false
          }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      },
      {
        name: 'electronCheck',
        successOutcome: true,
        check: async (): Promise<boolean> => {
          const isElectron: boolean = await deviceService.checkForElectron()
          const hasShownDisclaimer: boolean = await this.storageService.get(VaultStorageKey.DISCLAIMER_ELECTRON)

          return !isElectron || hasShownDisclaimer
        },
        failureConsequence: async (): Promise<void> => {
          await this.presentModal(DistributionOnboardingPage, { isInitialOnboarding: true }, {
            required: true,
            translationKey: 'distribution-onboarding.ask-permission.heading',
            manageInitialFocus: false
          }).catch(handleErrorLocal(ErrorCategory.INIT_CHECK))
        }
      }
    ]
  }

  public async presentModal(
    page: ComponentRef,
    properties: ModalOptions['componentProps'],
    metadata: StartupModalMetadata = {}
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const modal: HTMLIonModalElement = await this.modalAccessibilityService.create(
        page,
        properties,
        {
          backdropDismiss: false,
          ...(metadata.required
            ? {
                canDismiss: async (data?: { accepted?: boolean }) =>
                  data?.accepted === true
              }
            : {})
        },
        {
          manageInitialFocus: metadata.manageInitialFocus,
          translationKey: metadata.translationKey
        }
      )

      modal
        .present()
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))

      modal
        .onDidDismiss()
        .then(() => {
          resolve()
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
    })
  }

  public initChecks(): Promise<void> {
    return new Promise(async (resolve) => {
      for (const check of this.checks) {
        if (+(await check.check()) !== +check.successOutcome) {
          await check.failureConsequence()
        }
      }
      resolve()
    })
  }
}
