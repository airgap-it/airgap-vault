import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Observable } from 'rxjs'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ClipboardService, IACMessageTransport, SerializerService } from '@airgap/angular-core'
import { IACService } from 'src/app/services/iac/iac.service'
import { InstallationTypePage } from '../Installation-type/installation-type.page'
import { OnboardingAdvancedModePage } from '../onboarding-advanced-mode/onboarding-advanced-mode.page'
import { OnboardingWelcomePage } from '../onboarding-welcome/onboarding-welcome.page'
import { ContactsService } from 'src/app/services/contacts/contacts.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  public readonly secrets: Observable<MnemonicSecret[]>

  constructor(
    public readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly modalController: ModalController,
    private readonly iacService: IACService,
    private readonly clipboardService: ClipboardService,
    private readonly navigationService: NavigationService,
    private readonly contactsService: ContactsService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  public goToAbout(): void {
    this.navigationService.route('/about').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionHistory(): void {
    this.navigationService.route('/interaction-history').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionSettings(): void {
    this.navigationService.route('/interaction-selection-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToLanguagesSettings(): void {
    this.navigationService.route('/languages-selection-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToErrorHistory(): void {
    this.navigationService.route('/error-history').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToQrSettings(): void {
    this.navigationService.route('/qr-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async goToAddressBook(): Promise<void> {
    if (await this.contactsService.isOnboardingEnabled())
      this.navigationService.route('/contact-book-onboarding').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    else this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async goToAddressBookSettings(): Promise<void> {
    if (await this.contactsService.isOnboardingEnabled())
      this.navigationService.route('/contact-book-onboarding').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    else this.navigationService.route('/contact-book-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async goToOnboarding(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: OnboardingWelcomePage,
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  // public async goToDisclaimer(): Promise<void> {
  //   const modal: HTMLIonModalElement = await this.modalController.create({
  //     component: WarningModalPage,
  //     componentProps: { errorType: Warning.SECURE_STORAGE },
  //     backdropDismiss: false
  //   })

  //   modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  // }

  public async goToInstallationType(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: InstallationTypePage,
      componentProps: { isSettingsModal: true },
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async goToAdvancedModeType(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: OnboardingAdvancedModePage,
      componentProps: { isSettingsModal: true },
      backdropDismiss: false
    })

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public goToBip39Wordlist(): void {
    this.navigationService.route('/wordlist').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToDangerZone(): void {
    this.navigationService.route('/danger-zone').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard(): void {
    this.clipboardService.paste().then(
      (text: string) => {
        console.log('pasteClipboard', text)
        this.iacService.handleRequest(text, IACMessageTransport.PASTE).catch((err) => console.error(err))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }
}
