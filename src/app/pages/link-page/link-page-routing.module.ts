import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { LinkPagePage } from './link-page.page'

const routes: Routes = [
  {
    path: '',
    component: LinkPagePage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkPagePageRoutingModule {}
