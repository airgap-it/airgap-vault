import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { ExternalAliasResolver } from '@airgap/angular-core'

export class ContactResolver implements ExternalAliasResolver {
  name: string = 'Contact' // TODO: Add to ExternalAliasResolver
  contactList: ContactEntry[] = []

  constructor(contactList: ContactEntry[]) {
    this.contactList = contactList
  }

  async validateReceiver(receiver: string): Promise<boolean> {
    const contact = this.contactList.find((contact) => contact.name === receiver)
    return !!contact
  }
  async resolveAlias(alias: string): Promise<string | undefined> {
    const contact = this.contactList.find((contact) => contact.name === alias)
    return contact.address
  }
  async getAlias(address: string): Promise<string | undefined> {
    const contact = this.contactList.find((contact) => contact.address === address)
    return contact.name
  }
}

export interface ContactEntry {
  id: string
  name: string
  description: string
  protocol: MainProtocolSymbols
  address: string
  extendedPublicKey: string
  createdAt: Date
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  contactList: ContactEntry[] = []

  constructor() {}

  async add(name: string, description: string, protocol: MainProtocolSymbols, address: string, extendedPublicKey: string): Promise<void> {
    this.contactList.push({
      id: Math.random().toString(), // TODO: UUID
      name,
      description,
      protocol,
      address,
      extendedPublicKey,
      createdAt: new Date()
    })

    this.persist()
  }

  async remove(id: string): Promise<void> {
    this.contactList = this.contactList.filter((contact) => contact.id !== id)

    this.persist()
  }

  async get(id: string): Promise<ContactEntry> {
    return this.contactList.find((contact) => contact.id === id)
  }

  async persist() {
    // TODO: Persist to storage
  }
}
