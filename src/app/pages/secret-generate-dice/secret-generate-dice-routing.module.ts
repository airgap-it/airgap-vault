import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SecretGenerateDicePage } from './secret-generate-dice.page'

const routes: Routes = [
  {
    path: '',
    component: SecretGenerateDicePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecretGenerateDicePageRoutingModule {}
