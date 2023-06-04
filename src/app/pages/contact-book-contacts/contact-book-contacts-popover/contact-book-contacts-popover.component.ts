import { Component, OnInit } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

export enum SortType {
  NAME = 'NAME',
  ADDRESS = 'ADDRESS',
  DATE_CREATION = 'DATE_CREATION',
  ADDED_BY = 'ADDED_BY'
}

@Component({
  selector: 'airgap-contact-book-contacts-popover',
  templateUrl: './contact-book-contacts-popover.component.html',
  styleUrls: ['./contact-book-contacts-popover.component.scss']
})
export class ContactBookContactsPopoverComponent implements OnInit {
  private readonly onClickSort: Function
  private readonly defaultSortType: SortType | undefined

  public sortTypes: { id: string; label: string }[] = [
    { id: SortType.NAME, label: 'Standard (Name)' },
    { id: SortType.ADDRESS, label: 'Address' },
    { id: SortType.DATE_CREATION, label: 'Creation Date' },
    { id: SortType.ADDED_BY, label: 'Added by' }
  ]
  public selectedSortType: SortType | undefined

  constructor(public navigationService: NavigationService) {}
  ngOnInit(): void {
    this.selectedSortType = this.defaultSortType
  }

  public async changeSort(sortType: SortType): Promise<void> {
    if (this.onClickSort) {
      this.onClickSort(sortType)
    }
  }
}
