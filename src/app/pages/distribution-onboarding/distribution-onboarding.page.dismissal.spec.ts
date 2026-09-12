import { DistributionOnboardingPage } from './distribution-onboarding.page'

describe('DistributionOnboardingPage dismissal', () => {
  it('dismisses with acceptance only after its completion state is saved', async () => {
    const modalController = { dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) }
    const storageService = { set: jasmine.createSpy('set').and.returnValue(Promise.resolve()) }
    const component = new DistributionOnboardingPage(modalController as any, storageService as any)

    await component.accept()

    expect(storageService.set).toHaveBeenCalled()
    expect(modalController.dismiss).toHaveBeenCalledWith({ accepted: true })
  })

  it('keeps the dialog open and announces an error when saving fails', async () => {
    const modalController = { dismiss: jasmine.createSpy('dismiss') }
    const storageService = { set: jasmine.createSpy('set').and.returnValue(Promise.reject(new Error('failed'))) }
    const component = new DistributionOnboardingPage(modalController as any, storageService as any)

    await component.accept()

    expect(component.saveError).toBe(true)
    expect(modalController.dismiss).not.toHaveBeenCalled()
  })
})
