import { Component, Input, OnInit } from '@angular/core'

export interface ContactEntry {
  address: string
  name: string
}

@Component({
  selector: 'airgap-contact-item',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.scss']
})
export class ContactItemComponent implements OnInit {
  @Input()
  public contact: ContactEntry

  constructor() {}

  ngOnInit() {}
}
