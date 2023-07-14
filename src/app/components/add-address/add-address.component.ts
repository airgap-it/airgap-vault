import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { Component, Input, OnInit } from '@angular/core'
import { AddType, ContactsService } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss']
})
export class AddAddressComponent implements OnInit {
  public addressesNotOnContactBook: string[] = []
  @Input() private airGapTxs: IAirGapTransaction[] = []

  constructor(private readonly navigationService: NavigationService, private readonly contactsService: ContactsService) {}

  async ngOnInit() {
    await this.checkAdressesNames()
  }

  private async storeAddress(transaction: IAirGapTransaction) {
    for (const address of [...transaction.from, ...transaction.to]) {
      const hasContactBookAddress = await this.contactsService.isAddressInContacts(address)
      if (!hasContactBookAddress) {
        this.addressesNotOnContactBook.push(address)
      } else {
        const name = await this.contactsService.getContactName(address)
        if (name) {
          transaction.extra.names[address] = name
        }
      }
    }
  }

  public async checkAdressesNames() {
    if (this.airGapTxs?.length <= 0 && !(await this.contactsService.isBookEnabled())) {
      return
    }

    this.addressesNotOnContactBook = []
    this.airGapTxs = this.airGapTxs.map((tx) => ({ ...tx, extra: { names: {} } }))
    this.airGapTxs.forEach((tx) => this.storeAddress(tx))
  }

  private async filterOutAddress(address: string) {
    await this.contactsService.addSuggestion(address)
    const index = this.addressesNotOnContactBook.findIndex((address) => address === address)
    if (index >= 0) {
      this.addressesNotOnContactBook.splice(index, 1)
    }
  }

  async onClickDontAddContact(address: string) {
    this.filterOutAddress(address)
  }

  async onClickAddContact(address: string) {
    this.filterOutAddress(address) // don't show the addres, because I'm adding it to the contact book
    this.navigationService
      .routeWithState('/contact-book-contacts-detail', { isNew: true, address, addType: AddType.SIGNING })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async onClickDisableContact() {
    await this.contactsService.setBookEnable(false)
    this.addressesNotOnContactBook = []
  }
}
