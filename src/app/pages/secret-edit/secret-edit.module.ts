import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

import { AccountsListEditPopoverComponent } from '../accounts-list/accounts-list-edit-popover/accounts-list-edit-popover.component'
import { SecretEditPage } from './secret-edit.page'
const routes: Routes = [
  {
    path: '',
    component: SecretEditPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SecretEditPage, AccountsListEditPopoverComponent]
})
export class SecretEditPageModule {}
