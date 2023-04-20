import { Component, EventEmitter, Input, Output } from '@angular/core'
import { AddType } from 'src/app/services/contacts/contacts.service'

export enum SortType {
  NAME = 'NAME',
  ADDRESS = 'ADDRESS',
  DATE_INTERACTION = 'DATE_INTERACTION',
  DATE_CREATION = 'DATE_CREATION',
  ADDED_BY = 'ADDED_BY'
}

@Component({
  selector: 'airgap-contact-book-contacts-suggestion',
  templateUrl: './contact-book-contacts-suggestion.component.html',
  styleUrls: ['./contact-book-contacts-suggestion.component.scss']
})
export class ContactBookContactsSuggestionComponent {
  public addEnum: typeof AddType = AddType

  @Input()
  public name: string

  @Input()
  public address: string

  @Output() onClickAdd = new EventEmitter<void>()

  @Output() onClickClose = new EventEmitter<void>()

  onClickAddHandler() {
    this.onClickAdd.emit();
  }

  onClickCloseHandler() {
    this.onClickClose.emit();
  }
}
