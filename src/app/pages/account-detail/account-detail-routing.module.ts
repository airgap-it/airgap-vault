import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AccountDetailPage } from './account-detail.page'

const routes: Routes = [
  {
    path: '',
    component: AccountDetailPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountDetailPageRoutingModule {}
