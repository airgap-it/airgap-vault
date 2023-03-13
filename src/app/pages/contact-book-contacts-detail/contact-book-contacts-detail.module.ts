import { ComponentsModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ContactBookContactsDetailPage } from './contact-book-contacts-detail.page'

const routes: Routes = [
  {
    path: '',
    component: ContactBookContactsDetailPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [ContactBookContactsDetailPage]
})
export class ContactBookContactsDetailPageModule {}
