import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AuditLogPage } from './audit-log.page'

const routes: Routes = [
  {
    path: '',
    component: AuditLogPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditLogPageRoutingModule {}
