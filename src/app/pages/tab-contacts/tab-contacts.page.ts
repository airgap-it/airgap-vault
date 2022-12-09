import { Component, OnInit } from '@angular/core'
import { ContactEntry } from 'src/app/components/contact-item/contact-item.component'
import { VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

@Component({
  selector: 'airgap-tab-contacts',
  templateUrl: './tab-contacts.page.html',
  styleUrls: ['./tab-contacts.page.scss']
})
export class TabContactsPage implements OnInit {
  contacts: ContactEntry[] = []
  constructor(private readonly storageService: VaultStorageService) {}

  async ngOnInit() {
    const contact1: ContactEntry = {
      address: '1111',
      name: 'contact1'
    }
    const contact2: ContactEntry = {
      address: 'alsjkndaonsd',
      name: 'contact3'
    }
    await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_LIST, [contact1, contact2])

    this.contacts = await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)

    console.log('contacts', this.contacts)
  }
}
export { ContactEntry }
