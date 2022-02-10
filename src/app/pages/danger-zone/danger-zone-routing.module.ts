import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { DangerZonePage } from './danger-zone.page'

const routes: Routes = [
  {
    path: '',
    component: DangerZonePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DangerZonePageRoutingModule {}
