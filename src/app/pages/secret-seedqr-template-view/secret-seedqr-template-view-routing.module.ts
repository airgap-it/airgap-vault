import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecretSeedqrTemplateViewPage } from './secret-seedqr-template-view.page';

const routes: Routes = [
  {
    path: '',
    component: SecretSeedqrTemplateViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretSeedqrTemplateViewPageRoutingModule {}
