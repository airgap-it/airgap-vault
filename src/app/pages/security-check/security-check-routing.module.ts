import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SecurityCheckPage } from './security-check.page'

const routes: Routes = [
  {
    path: '',
    component: SecurityCheckPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityCheckPageRoutingModule {}
