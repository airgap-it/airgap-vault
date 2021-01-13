import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { QrSettingsPage } from './qr-settings.page'

const routes: Routes = [
  {
    path: '',
    component: QrSettingsPage
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QrSettingsPageRoutingModule {}
