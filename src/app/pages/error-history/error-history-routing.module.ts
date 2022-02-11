import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ErrorHistoryPage } from './error-history.page'

const routes: Routes = [
  {
    path: '',
    component: ErrorHistoryPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorHistoryPageRoutingModule {}
