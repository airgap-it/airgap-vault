import { Injectable } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ComponentRef, ModalOptions } from '@ionic/core'
import { TranslateService } from '@ngx-translate/core'

export interface ModalAccessibilityOptions {
  /** Translation key used to name the Ionic dialog before it is presented. */
  translationKey?: string
  /** Already-localized dialog name for flows whose title is not in the translation catalog. */
  ariaLabel?: string
  /** Use when the page changes its active content and owns focus transitions. */
  manageInitialFocus?: boolean
}

@Injectable({ providedIn: 'root' })
export class ModalAccessibilityService {
  private readonly maxFocusFrames: number = 8

  constructor(private readonly modalController: ModalController, private readonly translateService: TranslateService) {}

  public async create(
    component: ComponentRef,
    componentProps: ModalOptions['componentProps'] = {},
    options: Omit<ModalOptions, 'component' | 'componentProps'> = {},
    accessibility: ModalAccessibilityOptions = {}
  ): Promise<HTMLIonModalElement> {
    return this.createFromOptions(
      {
        ...options,
        component,
        componentProps
      },
      accessibility
    )
  }

  public async createFromOptions(options: ModalOptions, accessibility: ModalAccessibilityOptions = {}): Promise<HTMLIonModalElement> {
    const modalOptions: ModalOptions = {
      ...options
    }

    const ariaLabel = accessibility.ariaLabel ?? (accessibility.translationKey ? this.translateService.instant(accessibility.translationKey) : undefined)
    if (ariaLabel && !modalOptions.htmlAttributes?.['aria-label']) {
      modalOptions.htmlAttributes = {
        ...modalOptions.htmlAttributes,
        'aria-label': ariaLabel
      }
    }

    const modal: HTMLIonModalElement = await this.modalController.create(modalOptions)
    if (accessibility.manageInitialFocus !== false) {
      modal.addEventListener('ionModalDidPresent', () => this.focusModalEntry(modal), { once: true })
    }

    return modal
  }

  private focusModalEntry(modal: HTMLIonModalElement): void {
    let frame = 0
    let preferredTargetTried = false
    const tryFocus = (): void => {
      const target = this.findFocusTarget(modal, preferredTargetTried)
      if (target && this.focus(target)) {
        return
      }

      // A marked target is preferred, but it must not starve a usable fallback
      // while Ionic finishes presenting the modal.
      preferredTargetTried = true

      if (frame++ < this.maxFocusFrames) {
        window.requestAnimationFrame(tryFocus)
      }
    }

    window.requestAnimationFrame(tryFocus)
  }

  private findFocusTarget(modal: HTMLElement, skipMarkedTarget: boolean = false): HTMLElement | undefined {
    const markedTarget = skipMarkedTarget ? undefined : this.querySelector(modal, '[data-modal-focus]')
    if (markedTarget) {
      if (!markedTarget.hasAttribute('tabindex')) {
        markedTarget.setAttribute('tabindex', '-1')
      }
      return markedTarget
    }

    const heading = this.querySelector(modal, 'h1, h2, h3, [role="heading"]')
    if (heading) {
      if (!heading.hasAttribute('tabindex')) {
        heading.setAttribute('tabindex', '-1')
      }
      return heading
    }

    return this.querySelector(modal, 'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), ion-button:not([disabled]), ion-checkbox:not([disabled]), ion-radio:not([disabled])')
  }

  private querySelector(root: ParentNode, selector: string): HTMLElement | undefined {
    const direct = root.querySelector<HTMLElement>(selector)
    if (direct) {
      return direct
    }

    for (const element of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
      if (element.shadowRoot) {
        const nested = this.querySelector(element.shadowRoot, selector)
        if (nested) {
          return nested
        }
      }
    }

    return undefined
  }

  private focus(element: HTMLElement): boolean {
    try {
      element.focus({ preventScroll: true })
      return document.activeElement === element || element.matches(':focus')
    } catch {
      return false
    }
  }
}
