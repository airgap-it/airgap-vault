import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { IsolatedModulesListPage } from './isolated-modules-list.page'

const routes: Routes = [
  {
    path: '',
    component: IsolatedModulesListPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IsolatedModulesListPageRoutingModule {}
