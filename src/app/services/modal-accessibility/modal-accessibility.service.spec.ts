import { ModalAccessibilityService } from './modal-accessibility.service'

describe('ModalAccessibilityService', () => {
  let modalController: { create: jasmine.Spy }
  let service: ModalAccessibilityService

  beforeEach(() => {
    modalController = { create: jasmine.createSpy('create') }
    service = new ModalAccessibilityService(modalController as any, { instant: (key: string) => key } as any)
  })

  function findFocusTarget(modal: HTMLElement, skipMarkedTarget: boolean = false): HTMLElement | undefined {
    return (service as any).findFocusTarget(modal, skipMarkedTarget)
  }

  it('makes a marked non-focusable heading programmatically focusable', () => {
    const modal = document.createElement('div')
    modal.innerHTML = '<h1 data-modal-focus>Title</h1>'

    const target = findFocusTarget(modal)

    expect(target).toBe(modal.querySelector('h1'))
    expect(target?.getAttribute('tabindex')).toBe('-1')
  })

  it('uses a heading when no marked target is present', () => {
    const modal = document.createElement('div')
    modal.innerHTML = '<h3>Account selection</h3><button>Continue</button>'

    const target = findFocusTarget(modal)

    expect(target).toBe(modal.querySelector('h3'))
    expect(target?.getAttribute('tabindex')).toBe('-1')
  })

  it('skips a marked target when choosing a fallback', () => {
    const modal = document.createElement('div')
    modal.innerHTML = '<div data-modal-focus>Preferred target</div><h2>Fallback title</h2><button>Continue</button>'

    expect(findFocusTarget(modal, true)).toBe(modal.querySelector('h2'))
  })

  it('tries a fallback target on the next animation frame when the preferred target fails', () => {
    const modal = document.createElement('div')
    modal.innerHTML = '<div data-modal-focus>Preferred target</div><h2>Fallback title</h2>'
    const frames: FrameRequestCallback[] = []
    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      frames.push(callback)

      return 1
    })
    const focus = spyOn<any>(service, 'focus').and.returnValues(false, true)
    const modalAccessibilityService: any = service

    modalAccessibilityService.focusModalEntry(modal)
    frames.shift()?.(0)
    frames.shift()?.(0)

    expect(focus.calls.argsFor(0)[0]).toBe(modal.querySelector('[data-modal-focus]'))
    expect(focus.calls.argsFor(1)[0]).toBe(modal.querySelector('h2'))
  })

  it('uses an interactive control when no heading is present', () => {
    const modal = document.createElement('div')
    modal.innerHTML = '<button>Continue</button>'

    expect(findFocusTarget(modal)).toBe(modal.querySelector('button'))
  })

  it('finds focus targets in a shadow root', () => {
    const modal = document.createElement('div')
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const heading = document.createElement('h2')
    heading.textContent = 'Shadow title'
    shadowRoot.appendChild(heading)
    modal.appendChild(host)

    expect(findFocusTarget(modal)).toBe(heading)
  })

  it('does not install an initial-focus listener when focus is managed by the page', async () => {
    const modal = document.createElement('ion-modal') as HTMLIonModalElement
    spyOn(modal, 'addEventListener')
    modalController.create.and.returnValue(Promise.resolve(modal))

    await service.createFromOptions({} as any, { manageInitialFocus: false })

    expect(modal.addEventListener).not.toHaveBeenCalled()
  })

  it('labels a modal from its translation key without replacing a caller label', async () => {
    const modal = document.createElement('ion-modal') as HTMLIonModalElement
    modalController.create.and.returnValue(Promise.resolve(modal))

    await service.createFromOptions({} as any, { translationKey: 'modal.title' })
    await service.createFromOptions({ htmlAttributes: { 'aria-label': 'Caller label' } } as any, { translationKey: 'modal.title' })

    expect(modalController.create.calls.argsFor(0)[0].htmlAttributes['aria-label']).toBe('modal.title')
    expect(modalController.create.calls.argsFor(1)[0].htmlAttributes['aria-label']).toBe('Caller label')
  })

  it('starts focus handling only after the modal is presented', async () => {
    const modal = document.createElement('ion-modal') as HTMLIonModalElement
    modal.innerHTML = '<h1>Title</h1>'
    modalController.create.and.returnValue(Promise.resolve(modal))
    const focusModalEntry = spyOn<any>(service, 'focusModalEntry')

    await service.createFromOptions({} as any)
    expect(focusModalEntry).not.toHaveBeenCalled()

    modal.dispatchEvent(new Event('ionModalDidPresent'))
    expect(focusModalEntry).toHaveBeenCalledWith(modal)
  })
})
