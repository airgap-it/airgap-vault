import { of } from 'rxjs'

import { DistributionOnboardingPage } from '../../pages/distribution-onboarding/distribution-onboarding.page'
import { IntroductionPage } from '../../pages/introduction/introduction.page'
import { OnboardingWelcomePage } from '../../pages/onboarding-welcome/onboarding-welcome.page'
import { InstallationTypePage } from '../../pages/Installation-type/installation-type.page'

import { StartupChecksService } from './startup-checks.service'

describe('startup onboarding dismissal', () => {
  let modal: { present: jasmine.Spy; onDidDismiss: jasmine.Spy }
  let modalAccessibilityService: { create: jasmine.Spy }
  let service: StartupChecksService

  beforeEach(() => {
    modal = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
    }
    modalAccessibilityService = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve(modal))
    }
    service = new StartupChecksService(
      {} as any,
      { checkForRoot: () => Promise.resolve(false), checkForElectron: () => Promise.resolve(false) } as any,
      modalAccessibilityService as any,
      {} as any,
      { getContextObservable: () => of('web') } as any
    )
  })

  it('prevents hardware Back and backdrop dismissal for every required startup onboarding', async () => {
    const requiredChecks = ['disclaimerAcceptedCheck', 'installationType', 'introductionAcceptedCheck', 'electronCheck']

    for (const name of requiredChecks) {
      const check = service.checks.find((candidate) => candidate.name === name)
      await check?.failureConsequence()
    }

    expect(modalAccessibilityService.create.calls.count()).toBe(4)
    for (let index = 0; index < modalAccessibilityService.create.calls.count(); index++) {
      const modalOptions = modalAccessibilityService.create.calls.argsFor(index)[2]

      expect(modalOptions.backdropDismiss).toBe(false)
      expect(await modalOptions.canDismiss(undefined, 'backdrop')).toBe(false)
      expect(await modalOptions.canDismiss(undefined, 'back')).toBe(false)
      expect(await modalOptions.canDismiss({ accepted: true }, 'confirm')).toBe(true)
    }
  })

  it('declares required-onboarding metadata at each startup call site', async () => {
    const requiredChecks = ['disclaimerAcceptedCheck', 'installationType', 'introductionAcceptedCheck', 'electronCheck']
    const expectedPages = [OnboardingWelcomePage, InstallationTypePage, IntroductionPage, DistributionOnboardingPage]

    for (const name of requiredChecks) {
      const check = service.checks.find((candidate) => candidate.name === name)
      await check?.failureConsequence()
    }

    expectedPages.forEach((page, index) => {
      const [actualPage, properties, , accessibility] = modalAccessibilityService.create.calls.argsFor(index)

      expect(actualPage).toBe(page)
      expect(properties.isInitialOnboarding).toBe(true)
      expect(accessibility.manageInitialFocus).toBe(false)
      expect(accessibility.translationKey).toBeTruthy()
    })
  })
})
