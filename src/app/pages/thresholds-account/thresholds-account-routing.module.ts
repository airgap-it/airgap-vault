import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ThresholdsAccountPage } from './thresholds-account.page'

const routes: Routes = [
  {
    path: '',
    component: ThresholdsAccountPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThresholdsAccountPageRoutingModule {}
