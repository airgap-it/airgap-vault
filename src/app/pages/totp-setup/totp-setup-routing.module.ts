import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { TotpSetupPage } from './totp-setup.page'

const routes: Routes = [
  {
    path: '',
    component: TotpSetupPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TotpSetupPageRoutingModule {}
