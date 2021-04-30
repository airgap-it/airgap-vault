import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SeedXorGeneratePage } from './seed-xor-generate.page'

const routes: Routes = [
  {
    path: '',
    component: SeedXorGeneratePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeedXorGeneratePageRoutingModule {}
