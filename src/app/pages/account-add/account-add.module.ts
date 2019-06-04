import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { AccountAddPage } from './account-add.page'

const routes: Routes = [
  {
    path: '',
    component: AccountAddPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ComponentsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [AccountAddPage]
})
export class AccountAddPageModule {}
