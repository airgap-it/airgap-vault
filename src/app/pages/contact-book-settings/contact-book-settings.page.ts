import { Component, OnInit } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-contact-book-settings',
  templateUrl: './contact-book-settings.page.html',
  styleUrls: ['./contact-book-settings.page.scss']
})
export class ContactBookSettingsPage implements OnInit {
  public bookEnabled: boolean = true
  public suggestionsEnabled: boolean

  constructor(
    private readonly navigationService: NavigationService,
    private readonly contactsService: ContactsService,
    private readonly alertCtrl: AlertController,
    private readonly translateService: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    this.contactsService.isBookEnabled().then((value: boolean) => (this.bookEnabled = value))
    this.contactsService.isSuggestionsEnabled().then((value: boolean) => (this.suggestionsEnabled = value))
  }

  public async toggleAddressBook(event: any) {
    const value = event.detail.checked
    await this.contactsService.setBookEnable(value)
  }

  public async toggleEnableSuggestions(event: any) {
    const value = event.detail.checked
    await this.contactsService.setSuggestionsEnable(value)
  }

  public async onClickDelete() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('contacts-delete-popover.title'),
      message: this.translateService.instant('contacts-delete-popover.text'),
      buttons: [
        {
          text: this.translateService.instant('contacts-delete-popover.cancel_label'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('contacts-delete-popover.delete_label'),
          handler: async () => {
            try {
              await this.contactsService.deleteAllContacts()
              await this.contactsService.setOnboardingEnable(true)
              await this.navigationService.route('/tabs/tab-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
            } catch (e) {
              console.error('Deleting Entries failed', e)
            }
          }
        }
      ]
    })
    alert.present()
  }
}
