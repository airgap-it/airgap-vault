import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AuditLogDetailPage } from './audit-log-detail.page'

const routes: Routes = [
  {
    path: '',
    component: AuditLogDetailPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditLogDetailPageRoutingModule {}
