import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

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
