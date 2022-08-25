import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AccountsListPage } from './accounts-list.page'

const routes: Routes = [
  {
    path: '',
    component: AccountsListPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsListPageRoutingModule {}
