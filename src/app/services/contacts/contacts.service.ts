import { Injectable } from '@angular/core'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

export enum AddType {
  QR = 'QR',
  MANUAL = 'MANUAL',
  RECOMMENDED = 'RECOMMENDED',
  SIGNING = 'SIGNING'
}

export interface ContactInfo {
  id: string
  name: string
  address: string
  date: string
  addedFrom: AddType
}

export interface ContactType {
  id: string
  name: string
  address: string
  date: string
  addedFrom: AddType
  transactions: string[]
}

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  constructor(private readonly storageService: VaultStorageService) {}

  async getSuggestions(): Promise<string[]> {
    return (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST)) as string[]
  }

  async addSuggestion(address: string): Promise<void> {
    const storedRecommendations: string[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST)) as string[]

    const index = storedRecommendations.findIndex((suggestion) => suggestion === address)
    if (index < 0) {
      storedRecommendations.push(address)
      await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST, storedRecommendations)
    } else console.error('Suggestion already stored')
  }

  async deleteSuggestion(address: string): Promise<void> {
    const storedRecommendations: string[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST)) as string[]

    const index = storedRecommendations.findIndex((suggestion) => suggestion === address)
    if (index >= 0) {
      storedRecommendations.splice(index, 1)
      await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST, storedRecommendations)
    } else console.error('Invalid suggestion')
  }

  async getContactsInfo(): Promise<ContactInfo[]> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]
    return storedContacts
  }

  async createContact(name: string, address: string, addedFrom: AddType): Promise<void> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]
    const storedRecommendations: string[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST)) as string[]

    storedContacts.push({
      id: `contact${storedContacts.length + 1}`,
      date: `${new Date().getDate()}. ${new Date().toLocaleString('default', { month: 'short' })}`,
      name,
      address,
      addedFrom,
      transactions: []
    })

    const index = storedRecommendations.findIndex((recommendation) => recommendation === address)
    if (index >= 0) {
      storedRecommendations.splice(index, 1)
      await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST, storedRecommendations)
    }
    await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_LIST, storedContacts)
  }

  async updateContact(id: string, name: string, address: string): Promise<void> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]

    const index = storedContacts.findIndex((contact) => contact.id === id)
    if (index < 0) {
      console.error('No contact with id', id)
      return
    }
    const contact = storedContacts[index]
    contact.name = name
    contact.address = address

    await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_LIST, storedContacts)
  }

  async deleteContact(id: string): Promise<void> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]

    const index = storedContacts.findIndex((contact) => contact.id === id)
    if (index < 0) {
      console.error('No contact with id', id)
      return
    }
    storedContacts.splice(index, 1)
    await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_LIST, storedContacts)
  }

  async deleteAllContacts(): Promise<void> {
    await this.storageService.set(VaultStorageKey.AIRGAP_CONTACTS_LIST, [])
  }

  async isBookEnabled(): Promise<boolean> {
    return !(await this.storageService.get(VaultStorageKey.ADDRESS_BOOK_DISABLED))
  }

  async setBookEnable(value: boolean) {
    await this.storageService.set(VaultStorageKey.ADDRESS_BOOK_DISABLED, !value)
  }

  async isSuggestionsEnabled(): Promise<boolean> {
    return !(await this.storageService.get(VaultStorageKey.ADDRESS_BOOK_SUGGESTIONS_DISABLED))
  }

  async setSuggestionsEnable(value: boolean) {
    await this.storageService.set(VaultStorageKey.ADDRESS_BOOK_SUGGESTIONS_DISABLED, !value)
  }

  async isOnboardingEnabled(): Promise<boolean> {
    return !(await this.storageService.get(VaultStorageKey.ADDRESS_BOOK_ONBOARDING_DISABLED))
  }

  async setOnboardingEnable(value: boolean) {
    await this.storageService.set(VaultStorageKey.ADDRESS_BOOK_ONBOARDING_DISABLED, !value)
  }

  async isAddressInContacts(address: string): Promise<boolean> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]
    const storedRecommendations: string[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST)) as string[]

    const contactFound = storedContacts.find((contact) => contact.address === address)
    const recommendationFound = storedRecommendations.find((recommendation) => recommendation === address)

    return !!contactFound && !recommendationFound
  }

  async getContactName(address: string): Promise<string | undefined> {
    const storedContacts: ContactType[] = (await this.storageService.get(VaultStorageKey.AIRGAP_CONTACTS_LIST)) as ContactType[]
    const contact = storedContacts.find((contact) => contact.address == address)
    if (contact) return contact.name
    else return undefined
  }
}
