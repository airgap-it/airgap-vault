import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { AccountAddPage } from './account-add.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

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
