import { InstallationTypePage } from './installation-type.page'

describe('InstallationTypePage dismissal', () => {
  it('dismisses with acceptance only after its completion state is saved', async () => {
    const modalController = { dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()) }
    const storageService = { get: () => Promise.resolve('ONLINE'), set: jasmine.createSpy('set').and.returnValue(Promise.resolve()) }
    const component = new InstallationTypePage(modalController as any, storageService as any)

    await component.next()

    expect(storageService.set).toHaveBeenCalled()
    expect(modalController.dismiss).toHaveBeenCalledWith({ accepted: true })
  })

  it('keeps the dialog open and announces an error when saving fails', async () => {
    const modalController = { dismiss: jasmine.createSpy('dismiss') }
    const storageService = { get: () => Promise.resolve('ONLINE'), set: jasmine.createSpy('set').and.returnValue(Promise.reject(new Error('failed'))) }
    const component = new InstallationTypePage(modalController as any, storageService as any)

    await component.next()

    expect(component.saveError).toBe(true)
    expect(modalController.dismiss).not.toHaveBeenCalled()
  })
})
