import { of } from 'rxjs'

import { TabSettingsPage } from './tab-settings.page'

describe('TabSettingsPage onboarding dismissal', () => {
  it('opens settings onboarding without the required-startup dismissal guard', async () => {
    const modal = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) }
    const modalAccessibilityService = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve(modal)) }
    const component = new TabSettingsPage(
      {} as any,
      { getSecretsObservable: () => of([]) } as any,
      modalAccessibilityService as any,
      {} as any,
      {} as any,
      {} as any,
      { isBookDisabled$: () => of(false) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { getContextObservable: () => of('web') } as any
    )

    await component.goToOnboarding()

    const [, componentProps, modalOptions] = modalAccessibilityService.create.calls.mostRecent().args
    expect(componentProps.isSettingsModal).toBe(true)
    expect(modalOptions.canDismiss).toBeUndefined()
  })
})
