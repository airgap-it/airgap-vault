import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ThresholdsPage } from './thresholds.page'

const routes: Routes = [
  {
    path: '',
    component: ThresholdsPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThresholdsPageRoutingModule {}
