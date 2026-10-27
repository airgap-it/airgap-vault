import { KeyboardPopoverComponent } from './keyboard-popover.component'

describe('KeyboardPopoverComponent', () => {
  it('requests text input before closing the popover', () => {
    const component = new KeyboardPopoverComponent()
    const requestTextInput = jasmine.createSpy('requestTextInput')
    const close = jasmine.createSpy('close')
    ;(component as any).onTextInputRequested = requestTextInput
    ;(component as any).onClick = close

    component.requestTextInput()

    expect(requestTextInput).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
    expect(requestTextInput).toHaveBeenCalledBefore(close)
  })
})
