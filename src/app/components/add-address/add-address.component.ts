import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction';
import { Component, Input, OnInit } from '@angular/core';
import { AddType, ContactsService } from 'src/app/services/contacts/contacts.service';
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';

@Component({
  selector: 'airgap-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss'],
})
export class AddAddressComponent  implements OnInit {
  public addressesNotOnContactBook: string[] = []
  @Input() private airGapTxs: IAirGapTransaction[] = []
  // selectTransactionsDetails
  // this.transactionsDetails$ = this.store.select(fromDeserializedDetail.selectTransactionsDetails)

  constructor(private readonly navigationService: NavigationService, private readonly contactsService: ContactsService) { }

  async ngOnInit() {
    await this.checkAdressesNames()
  }

  public async checkAdressesNames() {
    // Check for addresses in contact book
    if (this.airGapTxs && this.airGapTxs.length > 0) {
      const isBookenabled = await this.contactsService.isBookEnabled()
      if (isBookenabled) {
        this.addressesNotOnContactBook = []
        for (let i = 0; i < this.airGapTxs.length; i++) {
          this.airGapTxs[i].extra = { names: {} }
          const transaction = this.airGapTxs[i]
          const toAddresses = transaction.to
          for (let j = 0; j < toAddresses.length; j++) {
            const toAddress = toAddresses[j]
            const hasContactBookAddress = await this.contactsService.isAddressInContacts(toAddress)
            if (!hasContactBookAddress) this.addressesNotOnContactBook.push(toAddress)
            else {
              const name = await this.contactsService.getContactName(toAddress)
              if (name) this.airGapTxs[i].extra.names[toAddress] = name
            }
          }
          const fromAddresses = transaction.from
          for (let j = 0; j < fromAddresses.length; j++) {
            const fromAddress = fromAddresses[j]
            const hasContactBookAddress = await this.contactsService.isAddressInContacts(fromAddress)
            if (!hasContactBookAddress && !this.addressesNotOnContactBook.includes(fromAddress))
              this.addressesNotOnContactBook.push(fromAddress)
            else {
              const name = await this.contactsService.getContactName(fromAddress)
              if (name) this.airGapTxs[i].extra.names[fromAddress] = name
            }
          }
        }
      }
    }
  }

  async onClickDontAddContact(address: string) {
    await this.contactsService.addSuggestion(address)
    const index = this.addressesNotOnContactBook.findIndex((address) => address === address)
    if (index >= 0) {
      this.addressesNotOnContactBook.splice(index, 1)
    }
  }

  async onClickAddContact(address: string) {
    this.navigationService
      .routeWithState('/contact-book-contacts-detail', { isNew: true, address, addType: AddType.SIGNING })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async onClickDisableContact() {
    await this.contactsService.setBookEnable(false)
    this.addressesNotOnContactBook = []
  }

}
