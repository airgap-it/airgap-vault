import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AdvancedSettingsPage } from './advanced-settings.page'

const routes: Routes = [
  {
    path: '',
    component: AdvancedSettingsPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvancedSettingsPageRoutingModule {}
