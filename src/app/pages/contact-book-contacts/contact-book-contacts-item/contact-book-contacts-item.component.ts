import { Component, Input } from '@angular/core'
import { AddType } from 'src/app/services/contacts/contacts.service'

export enum SortType {
  NAME = 'NAME',
  ADDRESS = 'ADDRESS',
  DATE_INTERACTION = 'DATE_INTERACTION',
  DATE_CREATION = 'DATE_CREATION',
  ADDED_BY = 'ADDED_BY'
}

@Component({
  selector: 'airgap-contact-book-contacts-item',
  templateUrl: './contact-book-contacts-item.component.html',
  styleUrls: ['./contact-book-contacts-item.component.scss']
})
export class ContactBookContactsItemComponent {
  public addEnum: typeof AddType = AddType

  @Input()
  public name: string

  @Input()
  public address: string

  @Input()
  public date: string

  @Input()
  public addedFrom: AddType
}
