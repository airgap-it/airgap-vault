import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { TabAccountsPage } from './tab-accounts.page'

const routes: Routes = [
  {
    path: '',
    component: TabAccountsPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TabAccountsPage]
})
export class TabAccountsPageModule {}
