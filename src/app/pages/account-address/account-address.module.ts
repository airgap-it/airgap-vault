import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { AccountAddressPage } from './account-address.page'

const routes: Routes = [
  {
    path: '',
    component: AccountAddressPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [AccountAddressPage]
})
export class AccountAddressPageModule {}
