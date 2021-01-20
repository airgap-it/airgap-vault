import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SecretDetailPage } from './secret-detail.page'

const routes: Routes = [
  {
    path: '',
    component: SecretDetailPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecretDetailPageRoutingModule {}
