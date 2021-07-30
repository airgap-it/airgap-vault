import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SecureTextInputPage } from './secure-text-input.page'

const routes: Routes = [
  {
    path: '',
    component: SecureTextInputPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecureTextInputPageRoutingModule {}
