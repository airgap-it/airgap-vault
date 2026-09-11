import { OnboardingWelcomePage } from './onboarding-welcome.page'

describe('OnboardingWelcomePage', () => {
  it('dismisses with acceptance only after saving the disclaimer', async () => {
    const modalController = { dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) }
    const storageService = { set: jasmine.createSpy('set').and.returnValue(Promise.resolve()) }
    const component = new OnboardingWelcomePage(modalController as any, storageService as any)

    await component.acceptDisclaimer()

    expect(storageService.set).toHaveBeenCalled()
    expect(modalController.dismiss).toHaveBeenCalledWith({ accepted: true })
  })
})
