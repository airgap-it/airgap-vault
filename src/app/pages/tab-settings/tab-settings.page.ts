import { Component, OnInit } from '@angular/core'
import { AlertController, ModalController } from '@ionic/angular'
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
import { TranslateService } from '@ngx-translate/core'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage implements OnInit {
  public readonly secrets: Observable<MnemonicSecret[]>

  constructor(
    public readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly modalController: ModalController,
    private readonly iacService: IACService,
    private readonly clipboardService: ClipboardService,
    private readonly navigationService: NavigationService,
    private readonly contactsService: ContactsService,
    private readonly translateService: TranslateService,
    private readonly alertCtrl: AlertController,
    private readonly secureStorage: SecureStorageService,
    public readonly storageService: VaultStorageService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  ngOnInit() {}

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

  public async goToIsolatedModules() {
    this.navigationService.route('/isolated-modules-list').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
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

  public async resetVault() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe.alert.title'),
      message: this.translateService.instant('danger-zone.wipe.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe.alert.cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('danger-zone.wipe.alert.ok'),
          handler: async () => {
            try {
              await this.secureStorage.wipe()
              await this.storageService.wipe()
            } catch (e) {
              console.error('Wiping failed', e)
              return this.resetVaultError()
            }

            this.navigationService.route('/').then(() => {
              location.reload()
            })
          }
        }
      ]
    })
    alert.present()
  }

  public async resetVaultError() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('danger-zone.wipe-error.alert.title'),
      message: this.translateService.instant('danger-zone.wipe-error.alert.message'),
      buttons: [
        {
          text: this.translateService.instant('danger-zone.wipe-error.alert.ok')
        }
      ]
    })
    alert.present()
  }
}
