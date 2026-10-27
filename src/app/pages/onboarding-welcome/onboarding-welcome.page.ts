import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core'
import { IonContent, ModalController } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

interface WelcomeStep {
  image: string
  heading: string
  description: string
}

@Component({
  selector: 'airgap-onboarding-welcome',
  templateUrl: './onboarding-welcome.page.html',
  styleUrls: ['./onboarding-welcome.page.scss']
})
export class OnboardingWelcomePage implements AfterViewChecked {
  @ViewChild('stepHeading')
  private readonly stepHeading?: ElementRef<HTMLElement>

  @ViewChild('disclaimerHeading')
  private readonly disclaimerHeading?: ElementRef<HTMLElement>

  @ViewChild(IonContent)
  private readonly content?: IonContent

  public readonly steps: WelcomeStep[] = [
    {
      image: 'assets/img/onboarding-peace-of-mind.svg',
      heading: 'onboarding-welcome.steps.peace-of-mind.heading',
      description: 'onboarding-welcome.steps.peace-of-mind.description'
    },
    {
      image: 'assets/img/onboarding-watch-only.svg',
      heading: 'onboarding-welcome.steps.companion-wallet.heading',
      description: 'onboarding-welcome.steps.companion-wallet.description'
    },
    {
      image: 'assets/img/onboarding-offline.svg',
      heading: 'onboarding-welcome.steps.offline.heading',
      description: 'onboarding-welcome.steps.offline.description'
    },
    {
      image: 'assets/img/onboarding-backup-seed-phrase.svg',
      heading: 'onboarding-welcome.steps.backup.heading',
      description: 'onboarding-welcome.steps.backup.description'
    },
    {
      image: 'assets/img/onboarding-advanced.svg',
      heading: 'onboarding-welcome.steps.advanced.heading',
      description: 'onboarding-welcome.steps.advanced.description'
    },
    {
      image: 'assets/img/onboarding-terms.svg',
      heading: 'onboarding-welcome.steps.setup.heading',
      description: 'onboarding-welcome.steps.setup.description'
    }
  ]

  public currentStep: number = 0

  /**
   * This will be true if the page is opened as a modal from the settings page.
   */
  public isSettingsModal: boolean = false
  public isInitialOnboarding: boolean = false
  public isDisclaimer: boolean = false
  public isSaving: boolean = false
  public saveError: boolean = false

  private focusWhenRendered: 'welcome' | 'disclaimer' | undefined

  constructor(private readonly modalController: ModalController, private readonly storageService: VaultStorageService) {}

  public ionViewDidEnter(): void {
    this.focusWhenRendered = 'welcome'
  }

  public ngAfterViewChecked(): void {
    if (!this.focusWhenRendered) return
    const target = this.focusWhenRendered === 'disclaimer' ? this.disclaimerHeading : this.stepHeading
    if (!target) return
    const focusTarget = target.nativeElement
    this.focusWhenRendered = undefined
    requestAnimationFrame(() => {
      const scrollToTop = this.content?.scrollToTop(0)
      scrollToTop?.catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      focusTarget.focus()
    })
  }

  public get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1
  }

  public previous(): void {
    if (this.currentStep > 0) {
      this.currentStep--
      this.focusWhenRendered = 'welcome'
    }
  }

  public nextStep(): void {
    if (!this.isLastStep) {
      this.currentStep++
      this.focusWhenRendered = 'welcome'
    } else if (this.isSettingsModal) {
      this.close()
    } else {
      this.isDisclaimer = true
      this.saveError = false
      this.focusWhenRendered = 'disclaimer'
    }
  }

  public close(): void {
    this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public backToWelcome(): void {
    this.isDisclaimer = false
    this.saveError = false
    this.focusWhenRendered = 'welcome'
  }

  public async acceptDisclaimer(): Promise<void> {
    if (this.isSaving) return
    this.isSaving = true
    this.saveError = false
    try {
      await this.storageService.set(VaultStorageKey.DISCLAIMER_INITIAL, true)
      await this.modalController.dismiss({ accepted: true })
    } catch (error) {
      this.isSaving = false
      this.saveError = true
      handleErrorLocal(ErrorCategory.SECURE_STORAGE)(error as Error)
    }
  }
}
