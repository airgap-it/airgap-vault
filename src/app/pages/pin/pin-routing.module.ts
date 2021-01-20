import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { PinPage } from './pin.page'

const routes: Routes = [
  {
    path: '',
    component: PinPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PinPageRoutingModule {}
