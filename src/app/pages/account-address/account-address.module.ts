import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { AccountAddressPage } from './account-address.page'
import { AccountEditPopoverComponent } from './account-edit-popover/account-edit-popover.component'

const routes: Routes = [
  {
    path: '',
    component: AccountAddressPage
  }
]

@NgModule({
  entryComponents: [AccountEditPopoverComponent],
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [AccountAddressPage, AccountEditPopoverComponent]
})
export class AccountAddressPageModule {}
