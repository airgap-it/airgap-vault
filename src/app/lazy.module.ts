import { PagesModule, QrSettingsPage } from '@airgap/angular-core'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [PagesModule, RouterModule.forChild([{ path: '', component: QrSettingsPage, pathMatch: 'full' }])]
})
export class LazyModule {}
