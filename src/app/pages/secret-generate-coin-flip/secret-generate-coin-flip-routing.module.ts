import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SecretGenerateCoinFlipPage } from './secret-generate-coin-flip.page'

const routes: Routes = [
  {
    path: '',
    component: SecretGenerateCoinFlipPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecretGenerateCoinFlipPageRoutingModule {}
