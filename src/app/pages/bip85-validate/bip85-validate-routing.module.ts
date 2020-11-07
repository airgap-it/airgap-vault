import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { Bip85ValidatePage } from './bip85-validate.page'

const routes: Routes = [
  {
    path: '',
    component: Bip85ValidatePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Bip85ValidatePageRoutingModule {}
