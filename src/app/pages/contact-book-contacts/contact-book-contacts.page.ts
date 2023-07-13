import { Component, OnInit } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { AddType, ContactInfo, ContactsService } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { ContactBookContactsPopoverComponent, SortType } from './contact-book-contacts-popover/contact-book-contacts-popover.component'

enum SortDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING'
}

@Component({
  selector: 'airgap-contact-book-contacts',
  templateUrl: './contact-book-contacts.page.html',
  styleUrls: ['./contact-book-contacts.page.scss']
})
export class ContactBookContactsPage implements OnInit {
  public addEnum: typeof AddType = AddType
  public sortEnum: typeof SortType = SortType

  public sortType: SortType = SortType.NAME
  public sortDirection: SortDirection = SortDirection.DESCENDING

  public contacts: ContactInfo[] = []
  public contacts$ = this.contactsService.getContactsInfo$()
  public suggestions: string[] = []
  constructor(
    private readonly popoverCtrl: PopoverController,
    private readonly navigationService: NavigationService,
    private readonly contactsService: ContactsService
  ) {}

  async ngOnInit() {
    const suggestionsEnabled = await this.contactsService.isSuggestionsEnabled()
    this.suggestions = suggestionsEnabled ? await this.contactsService.getSuggestions() : []
  }

  setContacts(contacts: ContactInfo[]) {
    return (this.contacts = contacts)
  }
  public async onClickBack() {
    this.navigationService.route('/tabs/tab-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async onSearch(event: any) {
    const value = event.target.value.toLowerCase()
    const storedContacts = await this.contactsService.getContactsInfo()

    const result = storedContacts.filter(
      (contact) => contact.name.toLowerCase().includes(value) || contact.address.toLowerCase().includes(value)
    )
    this.contacts = result
  }

  public onClickNew(_: any) {
    this.navigationService
      .routeWithState('/contact-book-contacts-detail', { isNew: true }, { replaceUrl: true })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public onClickItem(contact: ContactInfo) {
    this.navigationService
      .routeWithState('/contact-book-contacts-detail', { contact: contact })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async onClickSort(event: any) {
    // TODO: error on second click
    const popover = await this.popoverCtrl.create({
      component: ContactBookContactsPopoverComponent,
      componentProps: {
        defaultSortType: this.sortType,
        onClickSort: (sortType: SortType): void => {
          this.sortType = sortType
          popover.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        }
      },
      event,
      translucent: true
    })

    popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async onClickAddSuggestion(address: string) {
    this.navigationService
      .routeWithState(
        '/contact-book-contacts-detail',
        { isNew: true, addType: AddType.RECOMMENDED, address: address },
        { replaceUrl: true }
      )
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async onClickCloseSuggestion(address: string) {
    await this.contactsService.deleteSuggestion(address)
    this.suggestions = await this.contactsService.getSuggestions()
  }

  private getKey(): string {
    switch (this.sortType) {
      case SortType.ADDED_BY:
        return 'addedFrom'
      case SortType.DATE_CREATION:
        return 'date'
      default:
        return 'name'
    }
  }

  getHeading(contacts: ContactInfo[]) {
    const key = this.getKey()
    return Array.from(new Set(contacts.map(contact => String(contact[key]).charAt(0)))).sort()
  }

  getContacts(contacts: ContactInfo[], key: string) {
    const _key = this.getKey()
    return contacts.filter(contact => String(contact[_key]).charAt(0) === key)
  }

}
