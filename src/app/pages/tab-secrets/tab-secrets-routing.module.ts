import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { TabSecretsPage } from './tab-secrets.page'

const routes: Routes = [
  {
    path: '',
    component: TabSecretsPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabSecretsPageRoutingModule {}
