import { ComponentsModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ContactBookContactsItemComponent } from './contact-book-contacts-item/contact-book-contacts-item.component'

import { ContactBookContactsPopoverComponent } from './contact-book-contacts-popover/contact-book-contacts-popover.component'
import { ContactBookContactsSuggestionComponent } from './contact-book-contacts-suggestion/contact-book-contacts-suggestion.component'
import { ContactBookContactsPage } from './contact-book-contacts.page'

const routes: Routes = [
  {
    path: '',
    component: ContactBookContactsPage
  }
]

@NgModule({
  entryComponents: [ContactBookContactsPopoverComponent, ContactBookContactsItemComponent, ContactBookContactsSuggestionComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [
    ContactBookContactsPage,
    ContactBookContactsPopoverComponent,
    ContactBookContactsItemComponent,
    ContactBookContactsSuggestionComponent
  ]
})
export class ContactBookContactsPageModule {}
