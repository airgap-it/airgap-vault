import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { IacHistoryPage } from './iac-history.page'

const routes: Routes = [
  {
    path: '',
    component: IacHistoryPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IacHistoryPageRoutingModule {}
