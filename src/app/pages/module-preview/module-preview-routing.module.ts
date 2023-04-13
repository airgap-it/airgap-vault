import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ModulePreviewPage } from './module-preview.page'

const routes: Routes = [
  {
    path: '',
    component: ModulePreviewPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulePreviewPageRoutingModule {}
