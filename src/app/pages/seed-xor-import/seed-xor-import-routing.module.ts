import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SeedXorImportPage } from './seed-xor-import.page'

const routes: Routes = [
  {
    path: '',
    component: SeedXorImportPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeedXorImportPageRoutingModule {}
