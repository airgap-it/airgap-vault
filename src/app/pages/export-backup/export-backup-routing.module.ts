import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ExportBackupPage } from './export-backup.page'

const routes: Routes = [
  {
    path: '',
    component: ExportBackupPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportBackupPageRoutingModule {}
