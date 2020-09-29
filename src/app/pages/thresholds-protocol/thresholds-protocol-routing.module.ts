import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ThresholdsProtocolPage } from './thresholds-protocol.page'

const routes: Routes = [
  {
    path: '',
    component: ThresholdsProtocolPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThresholdsProtocolPageRoutingModule {}
