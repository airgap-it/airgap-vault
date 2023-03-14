import { Component } from '@angular/core'
import { AddType, ContactsService, ContactType } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-contact-book-contacts-detail',
  templateUrl: './contact-book-contacts-detail.page.html',
  styleUrls: ['./contact-book-contacts-detail.page.scss']
})
export class ContactBookContactsDetailPage {
  public addEnum: typeof AddType = AddType

  public state: 'view' | 'new' | 'edit' = 'new'
  public contact: ContactType | undefined

  constructor(private readonly navigationService: NavigationService, private readonly contactsService: ContactsService) {}

  ionViewWillEnter() {
    const state = this.navigationService?.getState()
    if (state.isNew) {
      this.state = 'new'
      this.contact = {} as ContactType
      if (state.addType && state.addType === AddType.RECOMMENDED && state.address && state.address.length > 0) {
        this.contact.address = state.address
        this.contact.addedFrom = AddType.RECOMMENDED
      } else if (state.addType && state.addType === AddType.SIGNING && state.address && state.address.length > 0) {
        this.contact.address = state.address
        this.contact.addedFrom = AddType.SIGNING
      } else {
        this.contact.addedFrom = AddType.MANUAL
      }
    } else if (state.isEdit) this.state = 'edit'
    else if (state.contact) {
      this.state = 'view'
      this.contact = state.contact
    }
  }

  onClickBack() {
    this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  onClickCancel() {
    if (this.state === 'new') this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    else this.state = 'view'
  }

  async onClickFinish() {
    if (!this.contact) {
      console.error('No contact!')
      return
    }

    if (!this.contact.name || this.contact.name?.length <= 0) {
      console.error('No name!')
      return
    }

    if (!this.contact.address || this.contact.address?.length <= 0) {
      console.error('No address!')
      return
    }

    if (this.state === 'new') {
      await this.contactsService.createContact(this.contact.name, this.contact.address, this.contact.addedFrom)
      if (this.contact.addedFrom === AddType.RECOMMENDED) this.contactsService.deleteSuggestion(this.contact.address)
      if (this.contact.addedFrom === AddType.SIGNING)
        this.navigationService
          .routeWithState('/transaction-signed', { entao: true })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      else this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else if (this.state === 'edit') {
      await this.contactsService.updateContact(this.contact.id, this.contact.name, this.contact.address)
      this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    } else console.error('Invalid state on finish')
  }

  onClickEdit() {
    this.state = 'edit'
  }

  async onClickDelete() {
    await this.contactsService.deleteContact(this.contact.id)
    this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  onChangeName(event: any) {
    if (!this.contact) {
      this.contact = {} as ContactType
    }
    this.contact.name = event.target.value
  }

  onChangeAddress(event: any) {
    if (!this.contact) {
      this.contact = {} as ContactType
    }
    this.contact.address = event.target.value
  }
}
