import { MnemonicKeyboardComponent } from './mnemonic-keyboard.component'

describe('MnemonicKeyboardComponent', () => {
  it('emits a text-input request from the popover callback', async () => {
    const popoverController = { create: jasmine.createSpy('create') }
    const component = new MnemonicKeyboardComponent({} as any, {} as any, popoverController as any)
    const emit = spyOn(component.textInputRequested, 'emit')
    let popoverOptions: any
    popoverController.create.and.callFake((options: any) => {
      popoverOptions = options
      return Promise.resolve({ present: () => Promise.resolve() })
    })

    await component.presentPopover(new Event('click'))
    popoverOptions.componentProps.onTextInputRequested()

    expect(emit).toHaveBeenCalled()
  })
})
