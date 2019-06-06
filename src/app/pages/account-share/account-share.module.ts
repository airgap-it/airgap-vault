import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { AccountSharePage } from './account-share.page'

const routes: Routes = [
  {
    path: '',
    component: AccountSharePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [AccountSharePage]
})
export class AccountSharePageModule {}
